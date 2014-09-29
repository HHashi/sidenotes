var currentLocation = window.location.hash.slice(1).split('#')[0];

$(document).ready(function(){

  chrome.storage.onChanged.addListener(function(changes, namespace) {
    if(changes['bgNote']) {
      console.log('BG CHANGES - NEW: ', changes['bgNote']['newValue']);
      chrome.storage.local.get(null, function(result){ console.log('BGNOTE STORAGE: ',result['bgNote']); })
    };
  });

  // Activate textarea
  $('#textarea').attr('contenteditable','true');
  $('#textarea').focus();

  // Create note from textarea content
  $('#save-note').on('click', function(){

    var noteBody = $('#textarea').text();

    function setIframeData() {
      var chromeStorage = {};
      chromeStorage['iNote'] = { 'url': currentLocation, 'body': noteBody, 'date': JSON.stringify(new Date()) }
      chrome.storage.local.set(chromeStorage, function() {});
    };
    setIframeData();

  });

});
