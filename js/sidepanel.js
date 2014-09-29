var currentLocation = window.location.hash.slice(1).split('#')[0];

$(document).ready(function(){

  chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (key in changes) {
      var storageChange = changes[key];
      console.log('CHANGED STORAGE: key "%s" in namespace "%s" changed. ' +
                  'Old: "%s", New: "%s".',
                  key,
                  namespace,
                  storageChange.oldValue,
                  storageChange.newValue);
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
      chromeStorage['iframeSideNote'] = { 'url': currentLocation, 'body': noteBody, 'date': new Date() }
      chrome.storage.local.set(chromeStorage, function() {});
    };
    setIframeData();

  });

});
