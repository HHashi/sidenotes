var currentUrl = window.location.hash.slice(1).split('#')[0];
var hashConverter = new Hashes.SHA1;
var noteKey = hashConverter.hex(currentUrl);

document.addEventListener( "DOMContentLoaded", function(){
  var textarea = document.querySelector('#textarea');
  var indicator = document.querySelector('#sync-indicator');
  displayStoredData();
  textarea.focus();

  chrome.storage.onChanged.addListener(function(changes, namespace) {
    chrome.storage.local.get(null, function(result){
      if(result['saving']==='true'){
        indicator.style.background='#2ECC71';
        displayStoredData();
      } else {
        indicator.style.background='#f5d44f';
      }
    });
  });

  function getNewIframeData() {
    if (textarea.value){
      storeIframeData();
    }
  }

  function storeIframeData(){
    var note = {};
    chrome.storage.local.get(null, function(results){
        if(results[noteKey]){
          note[noteKey] = {'url': currentUrl,'body': JSON.stringify(textarea.value), 'createdAt': results[noteKey].createdAt, 'updatedAt': JSON.stringify(new Date()) };
        } else {
          note[noteKey] = {'url': currentUrl,'body': JSON.stringify(textarea.value), 'createdAt': JSON.stringify(new Date()), 'updatedAt': '' };
        }
      chrome.storage.local.set(note, function() {});
    });
    chrome.storage.local.set({saving: 'false'}, function(){});
  }

  function displayStoredData(){
    chrome.storage.local.get(null, function(result){
      console.log(result)
      console.log(noteKey)
      console.log(result[noteKey]);
      if(result[noteKey]){
        textarea.value = JSON.parse(result[noteKey]['body']);
      }
    });
  }


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
