$(document).ready(function(){
  var backgroundPage, appController;

  backgroundPage = chrome.extension.getBackgroundPage();
  appController = backgroundPage.appController;

  backgroundPage.client.authenticate({interactive:false}, function (error) {
    if (error) {
      alert('Authentication error: ' + error);
      client.reset();
    }
  });

  $('#dropboxLogin').click(function(e) {
    e.preventDefault();
    appController.authenticate();
  });

  //TODO: Refactor Into Function Above
  $('#dropboxSignup').click(function(e) {
    e.preventDefault();
    appController.authenticate();
  });

  $('#dropboxLogout').click(function(e) {
    e.preventDefault();
    appController.signOut();
  });
});
