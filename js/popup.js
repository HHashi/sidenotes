$(document).ready(function(){

  var backgroundPage = chrome.extension.getBackgroundPage();
  var appController = backgroundPage.appController;

  backgroundPage.client.authenticate({interactive:false}, function (error) {
    if (error) {
      alert('Authentication error: ' + error);
      client.reset();
    }
  });

  $('#dropbox-signin').click(function() {
    appController.authenticate();
  });

  $('#dropbox-signout').click(function() {
    appController.signOut();
    $('#loggedinfo').hide();
    $('#loggedin').hide();
    $('#dropbox-signin').show();
  });

  if (appController.isAuthenticated()) {
    $('#loggedinfo').show();
    $('#loggedin').show();
    window.close();
    $('#dropbox-signin').hide();
    appController.toggleSidePanel();
  }

});
