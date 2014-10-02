var backgroundNote, cursorPosition;

var currentUrl = window.location.hash.slice(1).split('#')[0];
var hashConverter = new Hashes.SHA1;
var noteKey = hashConverter.b64(currentUrl);

document.addEventListener( "DOMContentLoaded", function(){
  var textarea = document.querySelector('#textarea');
  var indicator = document.querySelector('#sync-indicator');
  displayStoredData();
  textarea.focus();

  //Query Local Storage Using URL and compare body
  chrome.storage.onChanged.addListener(function(changes, namespace) {
    var sidepanelBody, backgroundBody;

    chrome.storage.local.get(null, function(result){
      sidepanelBody = result.sidepanelNote.body;
      backgroundBody = result.backgroundNote.body;
    });

    if (sidepanelBody === backgroundBody) {
      indicator.style.background='#2ECC71';
    }

  });

  // Create note from textarea content
  function getNewIframeData() {
    if (textarea.value){
      storeIframeData();
    }
  }

  function storeIframeData(){
    var newNote = {};
    chrome.storage.local.get(null, function(results){
      var localNotes = results['sidenotes'];
      if(localNotes.length === 0){
          newNote[currentLocation] = {'body': JSON.stringify(textarea.value), 'date': JSON.stringify(new Date()) };
          localNotes.push(newNote);
      }
      for(var i=0;i<localNotes.length;i++){
        if(currentLocation == Object.keys(localNotes[i])[0]){
          localNotes[i][currentLocation] =  {'body': JSON.stringify(textarea.value), 'date': JSON.stringify(new Date()) };
        } else if (i === localNotes.length-1){
          newNote[currentLocation] = {'body': JSON.stringify(textarea.value), 'date': JSON.stringify(new Date()) };
          localNotes.push(newNote);
        }
      }
      chrome.storage.local.set({'sidenotes': localNotes}, function() {});
    });
  }

  function displayStoredData(){
    chrome.storage.local.get(null, function(result){
      var localNotes = result['sidenotes'];
      for(var i=0;i<localNotes.length;i++){
        var urlKey = Object.keys(localNotes[i])[0];
        if(currentLocation == urlKey){
          textarea.value = JSON.parse(localNotes[i][urlKey]['body']);
        }
      }
    });
  }


  // Autosave
  var timeoutId;

  textarea.addEventListener('keyup', function(){
    clearTimeout(timeoutId);

    if(textarea.value) {
      indicator.style.background='#f5d44f';
    };

    timeoutId = setTimeout(function() {
      getNewIframeData();
    }, 200);
  });

});
