// dependencies
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
// Notice: Our scraping tools are prepared, too
var request = require('request'); 
var cheerio = require('cheerio');

// use morgan and bodyparser with our app
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
  extended: false
}));

// make public a static dir
app.use(express.static('public'));


// Database configuration with mongoose
var dbName = "hackerNews";
mongoose.connect('mongodb://localhost/'+ dbName);
var db = mongoose.connection;

// show any mongoose errors
db.on('error', function(err) {
  console.log('Mongoose Error: ', err);
});

// once logged in to the db through mongoose, log a success message
db.once('open', function() {
  console.log('Mongoose connection successful.');
});


// And we bring in our Comment and Article models
var Comment = require('./models/Comment.js');
var Article = require('./models/Article.js');


// Routes
// ======

// Simple index route
app.get('/', function(req, res) {
  // query mongo to grab the data (porbably an array')
  res.send(index.html);
});

// A GET request to scrape the Good Reads website.
app.get('/scrape', function(req, res) {
  // first, we grab the body of the html with request
  request('https://news.ycombinator.com/', function(error, response, html) {
    // then, we load that into cheerio and save it to $ for a shorthand selector
    // console.log('this is the payloa', html)
    // if (error) throw error;
    var $ = cheerio.load(html);
    // now, we grab every h2 within an article tag, and do the following:
    $('a.storylink').each(function(i, element) {
        // console.log('this is a thing i want to store', element)
        // save an empty result object
        var result = {};

        // add the text and href of every link, 
        // and save them as properties of the result obj
        // result.title = $(this).children('a').text();
        // result.link = $(this).children('a').attr('href');
        result.title = this.children[0].data;
        result.link = this.attribs.href;
        // using our Article model, create a new entry.
        // Notice the (result):
        // This effectively passes the result object to the entry (and the title and link)
        var entry = new Article (result);

        // now, save that entry to the db
        entry.save(function(err, doc) {
          // log any errors
          if (err) {
            // console.log(err);
          } 
          // or log the doc
          else {
            // console.log(doc);
          }
        });


    });
  });
  // tell the browser that we finished scraping the text.
  res.send("Scrape Complete");
});

// this will get the articles we scraped from the mongoDB
app.get('/articles', function(req, res){
  // grab every doc in the Articles array
  Article.find({}, function(err, doc){
    // log any errors
    if (err){
      console.log(err);
    } 
    // or send the doc to the browser as a json object
    else {
      // console.log(doc); // confirm i am getting an array of objects back
      res.json(doc);
    }
  });
});

// grab an article by it's ObjectId
app.get('/articles/:id', function(req, res){
  // using the id passed in the id parameter, 
  // prepare a query that finds the matching one in our db...
  Article.findOne({'_id': req.params.id})
  // and populate all of the comment associated with it.
  .populate('comments')
  // now, execute our query
  .exec(function(err, doc){
    // log any errors
    if (err){
      console.log(err);
    } 
    // otherwise, send the doc to the browser as a json object
    else {
      res.json(doc);
      // res.send(index.html);
    }
  });
});


// replace the existing comment of an article with a new one
// or if no comment exists for an article, make the posted comment it's comment.
app.post('/articles/:id', function(req, res){
  // create a new Comment and pass the req.body to the entry.
  var newComment = new Comment(req.body);

  // and save the new comment the db
  newComment.save(function(err, doc){
    // log any errors
    if(err){
      console.log(err);
    } 
    // otherwise
    else {
      // using the Article id passed in the id parameter of our url, 
      // prepare a query that finds the matching Article in our db
      // and update it to make it's lone comment the one we just saved
      // Article.findOneAndUpdate({'_id': req.params.id}, {'comment':doc._id})
      // // execute the above query
      // .exec(function(err, doc){
      //   // log any errors
      //   if (err){
      //     console.log(err);
      //   } else {
      //     // or send the document to the browser
      //     res.json(doc);
      //   }
      // });


      Article.findOneAndUpdate({'_id': req.params.id}, {'Comment':doc._id}, { $push: { "comments": doc._id } }, { new: true }, function(err, newdoc) {
        // Send any errors to the browser
        if (err) {
          res.send(err);
        }
        // Or send the newdoc to the browser
        else {
          res.send(newdoc);
        }
      });


    }
  });
});

// Listen to Port
var port = process.env.PORT || 3000;
app.listen(port, function(){
  console.log('Running on port: ' + port);
});
