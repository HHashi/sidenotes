// Create DropBox Client for App
var client = new Dropbox.Client({key: 'APP_KEY'});

$(document).ready(function() {

  // Authenticate App in the background
  client.authenticate({interactive: false}, function (error) {
    if (error) {
        alert('Authentication error: ' + error);
    }
  });

  // User authenticates his Dropbox
  $('#dpauth').on('click', function(){
    client.authenticate();
  });

  // Clears user auth token
  $('#dplogout').on('click', function(){
    client.signOut();
  });

  // Check is user is authenticated
  if (client.isAuthenticated()) {

    console.log('Auth success, User: ' + client.dropboxUid());

  };
});
