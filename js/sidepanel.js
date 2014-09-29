var currentLocation = window.location.hash.slice(1).split('#')[0];
var backgroundNote;

$(document).ready(function(){

  chrome.storage.onChanged.addListener(function(changes, namespace) {
    if(changes['backgroundNote']) {
      chrome.storage.local.get(null, function(result){
        $('#textarea').text(result['backgroundNote']['body']);
      });
    }
  });

  // Activate textarea
  $('#textarea').attr('contenteditable','true');
  $('#textarea').focus();

  // Create note from textarea content
  $('#save-note').on('click', function(){

    var noteBody = $('#textarea').text();

    function setIframeData() {
      var chromeStorage = {};
      chromeStorage['iframeNote'] = { 'url': currentLocation, 'body': noteBody, 'date': JSON.stringify(new Date()) };
      chrome.storage.local.set(chromeStorage, function() {});
    };
    setIframeData();

  });

});
