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

});
