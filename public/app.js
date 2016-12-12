// grab the articles as a json
$.getJSON('/articles', function(data) {
  // for each one
  for (var i = 0; i<data.length; i++){
    // display the apropos information on the page
   $('#articles').append( '<li data-id="' + data[i]._id + '">'+ data[i].title + '<br />'+ data[i].link + '</li>');

    // console.log('i did a thing')
  }
});

// whenever someone clicks a p tag
// $(document).on('click', 'p', function(){
  var Newcomments = function(data_id){
  // empty the comment from the comment section
  $('#comments').empty();
  // save the id from the p tag
  var thisId = $(this).attr('data-id');

  // now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId,
  })
    // with that done, add the comment information to the page
    .done(function( data ) {
      console.log(data);
      // the title of the article
      $('#comments').append('<h2>' + data.title + '</h2>'); 
      // an input to enter a new title
      $('#comments').append('<input id="titleinput" name="title" >'); 
      // a textarea to add a new comment body
      $('#comments').append('<textarea id="bodyinput" name="body"></textarea>'); 
      // a button to submit a new comment, with the id of the article saved to it
      $('#comments').append('<button data-id="' + data._id + '" id="savecomment">Save Comment</button>');

      // if there's a comment in the article
      if(data.comment){
        // place the title of the comment in the title input
        $('#titleinput').val(data.comment.title);
        // place the body of the comment in the body textarea
        $('#bodyinput').val(data.comment.body);
      }
    });
};

// when you click the savecomment button
// $(document).on('click', '#savecomment', function(){
//   console.log("trying to save coment");
//   // grab the id associated with the article from the submit button
//   var thisId = $(this).attr('data-id');

//   // run a POST request to change the comment, using what's entered in the inputs
//   $.ajax({
//     method: "POST",
//     url: "/articles/" + thisId,
//     data: {
//       title: $('#titleinput').val(), // value taken from title input
//       body: $('#bodyinput').val() // value taken from comment textarea
//     }
//   })
//     // with that done
//     .done(function( data ) {
//       // log the response
//       console.log(data);
//       // empty the comment section
//       $('#comments').empty();
//     });

//   // Also, remove the values entered in the input and textarea for comment entry
//   $('#titleinput').val("");
//   $('#bodyinput').val("");
// });

$(function(){
  $(document).on('click', 'li', function(){
    // alert('click');
    var id = $(this).data('id'),
    newAction = 'articles/'+id;
    $('form').attr('action', newAction);
// URL root (so it works in eith Local Host for Heroku)
     var baseURL = window.location.origin;

// AJAX Call to add Comment
    $.ajax({
      url: baseURL + '/add/comment/' + id,
      type: 'POST',
    })
    .done(function() {
      // Refresh the Window after the call is done
      location.reload();
    });
    
    // Prevent Default
    return false;


  });
});


$(function(){
  $('#comment-form').on('submit', function(e){
    e.preventDefault();
    e.stopPropagation();
    $.ajax({
      method: "POST",
      url: $(this).attr('action'),
      data: {
        title: $('#titleinput').val(), // value taken from title input
        body: $('#bodyinput').val() // value taken from comment textarea
      }
    })
    // with that done
    .done(function( data ) {
      // log the response
      console.log(data);
      // empty the comment section      
    });
    // Also, remove the values entered in the input and textarea for comment entry
    $('#titleinput').val("");
    $('#bodyinput').val("");
  });
});