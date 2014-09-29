$(document).ready(function(){

document.addEventListener( "DOMContentLoaded", function(){

  var backgroundPage = chrome.extension.getBackgroundPage();
  var appController = backgroundPage.appController;

  backgroundPage.client.authenticate({interactive:false}, function (error) {
    if (error) {
      alert('Authentication error: ' + error);
      client.reset();
    }
  });

  document.querySelector('#dropbox-signin').addEventListener('click', function() {
    appController.authenticate();
  });

  if (appController.isAuthenticated()) {
    window.close();
    appController.toggleSidePanel();
  }

});
