var backgroundNote, cursorPosition;

var currentLocation = window.location.hash.slice(1).split('#')[0];

document.addEventListener( "DOMContentLoaded", function(){
  var textarea = document.querySelector('#textarea');
  var indicator = document.querySelector('#sync-indicator');
  displayStoredData();
  textarea.focus();

  // Functions for setting the caret/cursor position
  Caret = {
      setSelectionRange : function(input, selectionStart, selectionEnd) {
          if (input.setSelectionRange) {
              input.focus();
              input.setSelectionRange(selectionStart, selectionEnd);
          }
          else if (input.createTextRange) {
              var range = input.createTextRange();
              range.collapse(true);
              range.moveEnd('character', selectionEnd);
              range.moveStart('character', selectionStart);
              range.select();
          }
      }
  };

  chrome.storage.onChanged.addListener(function(changes, namespace) {
    var sidepanelBody, backgroundBody;

    chrome.storage.local.get(null, function(result){
      sidepanelBody = result.sidepanelNote.body;
      backgroundBody = result.backgroundNote.body;
    });

    if (sidepanelBody === backgroundBody) {
      indicator.style.background='#2ECC71'
    };

  });

  // Create note from textarea content
  function getNewIframeData() {
    if (textarea.value){
      storeIframeData()
    }
  };

  function storeIframeData(){
    var chromeStorage = {};
    chromeStorage['sidepanelNote'] = { 'url': currentLocation, 'body': JSON.stringify(textarea.value), 'date': JSON.stringify(new Date()) };
      chrome.storage.local.set(chromeStorage, function() {});
  }

  function displayStoredData(){
    chrome.storage.local.get(null, function(result){
      if(result['backgroundNote']['url'] === currentLocation){
        textarea.value = JSON.parse(result['backgroundNote']['body']);
      }
    });
  }


  // Autosave
  var timeoutId;

  textarea.addEventListener('keyup', function(){
    clearTimeout(timeoutId);

    if(textarea.value) {
      indicator.style.background='#f5d44f'
    };

    timeoutId = setTimeout(function() {
      getNewIframeData();
    }, 200);
  });

});
