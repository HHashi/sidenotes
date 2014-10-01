document.addEventListener( "DOMContentLoaded", function(){

  var backgroundPage = chrome.extension.getBackgroundPage();
  var appController = backgroundPage.appController;

  document.querySelector('#dropbox-signin').addEventListener('click', function() {
    appController.authenticate();
  });

  if (appController.isAuthenticated()) {
    window.close();
    appController.toggleSidePanel();
  }

});
