var DROPBOX_APP_KEY = 'e4fbthwtr2v9ksp';

// Create DropBox Client for App
var client = new Dropbox.Client({key: DROPBOX_APP_KEY});
var panelDisplayed;

client.onAuthStepChange.addListener(function(event) {
  if (client.isAuthenticated()) {
    onLogin();
  }
});

// chrome.storage.onChanged.addListener(function(changes, namespace) {
//   for (key in changes) {
//     var storageChange = changes[key];
//     console.log('CHANGED STORAGE: key "%s" in namespace "%s" changed. ' +
//                 'Old: "%s", New: "%s".',
//                 key,
//                 namespace,
//                 storageChange.oldValue,
//                 storageChange.newValue);
//   }
// });

appController = {
  isAuthenticated: function(){
    return client.isAuthenticated();
  },
  authenticate: function(){
    client.authenticate();
  },
  signOut: function(){
    client.signOut(null, function(){
      client.reset();
    });
  },
  toggleSidePanelScript: function(){

    var closeSidePanel = function(){
      var sidebar = document.querySelector('#sidenote_sidebar');
      document.body.removeChild(sidebar);
    };

    var openSidePanel = function(){
      var currentLocation = window.location.toString();
      var newElement = document.createElement('iframe');
      newElement.setAttribute("id", "sidenote_sidebar");
      newElement.setAttribute("style", "background: #fff; z-index: 999999999999999; position: fixed; top: 0px; right: 0px; bottom: 0px; width: 300px; height: 100%; border-left:1px solid #eee; box-shadow:0 -1px 7px 0px #aaa; overflow-x: hidden;");
      newElement.setAttribute("src", "chrome-extension://afbonmgmjbiofanjpldocnjbdkpeodbj/html/sidepanel.html#" + currentLocation);
      newElement.setAttribute("allowtransparency", "false");
      newElement.setAttribute("scrolling", "yes");
      document.body.appendChild(newElement);
    };

    if (document.querySelector('#sidenote_sidebar')) {
      document.body.style.width = (document.body.clientWidth + 300) + "px";
      closeSidePanel();
    }
    else {
      document.body.style.width = (document.body.clientWidth - 300) + "px";
      openSidePanel();
    }
  },
  formatScript: function(script, format){
    return script.toString().split("\n").slice(1, -1).join(format);
  },
  toggleSidePanel: function() {
    chrome.tabs.executeScript({code: this.formatScript(this.toggleSidePanelScript, "\n")});
  }
};

// Open default datastore for current user
function onLogin(){
  client.getDatastoreManager().openDefaultDatastore(function (error, datastore) {

    console.log('DATASTORE WORKING: ', datastore)

    if (error) {
      console.log('Error opening default datastore: ' + error);
    }

    // Open table in datastore
    var currentTable = datastore.getTable('sideNotes');

    // chrome.storage.local.set({'bgbody': 'backgroundbody'}, function(result) { console.log('set', result); });
    // chrome.storage.local.get('ibody', function(result) { console.log('get', result) });
    // chrome.storage.local.get(null, function(result) { console.log('get', result) });

    chrome.storage.onChanged.addListener(function(changes, namespace) {
      var iNote = chrome.storage.local.get('iNote', function(result) {
        return iNote = result['iNote'];
      });

      // Create note from textarea content
      currentTable.insert({
        url: iNote['url'],
        body: iNote['body'],
        date: iNote['date']
      });

    });

  });
};
