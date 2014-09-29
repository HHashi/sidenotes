var currentLocation = window.location.hash.slice(1).split('#')[0];
var bgNote;

$(document).ready(function(){

  chrome.storage.onChanged.addListener(function(changes, namespace) {
    if(changes['bgNote']) {
      console.log('BG CHANGES - NEW: ', changes['bgNote']['newValue']);
      chrome.storage.local.get(null, function(result){
        console.log('BGNOTE STORAGE: ',result['bgNote']);
        $('#textarea').text(result['bgNote']['body']);
      })
    };
  });

  // Activate textarea
  $('#textarea').attr('contenteditable','true');
  $('#textarea').focus();

  // Create note from textarea content


  function setIframeData() {
    var noteBody = $('#textarea').text();
    console.log('Saving to local.')
    var chromeStorage = {};
    chromeStorage['iNote'] = { 'url': currentLocation, 'body': noteBody, 'date': JSON.stringify(new Date()) }
    chrome.storage.local.set(chromeStorage, function() {});
  };

  // Autosave
  var timeoutId;
  $('#textarea').on('input propertychange change', function(){
    console.log('Textarea Change');

    clearTimeout(timeoutId);
    timeoutId = setTimeout(function() {
      setIframeData();
    }, 3000);

  });

});
