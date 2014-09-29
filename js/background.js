var DROPBOX_APP_KEY = 'e4fbthwtr2v9ksp';

// Create DropBox Client for App
var client = new Dropbox.Client({key: DROPBOX_APP_KEY});

client.onAuthStepChange.addListener(function(event) {
  if (client.isAuthenticated()) {
    onLogin();
  }
});

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
  },
  openPastNote: function(noteUrl){
    chrome.tabs.create({url: noteUrl}, function(tab){
      appController.toggleSidePanel();
    });
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

    // Listen for changes from iframe and push to datastore
    chrome.storage.onChanged.addListener(function(changes, namespace) {
      currentTable.insert({
        url: changes['iNote']['newValue']['url'],
        body: changes['iNote']['newValue']['body'],
        date: changes['iNote']['newValue']['date']
      });
    });

    // Add event listener for changed records (local and remote)
    datastore.recordsChanged.addListener(function(event) {
      var changedRecords = event.affectedRecordsForTable(currentTable._tid);
      console.log(changedRecords);
      // function setIframeData() {
      //   var chromeStorage = {};
      //   chromeStorage['iNote'] = { 'url': currentLocation, 'body': noteBody, 'date': new Date() }
      //   chrome.storage.local.set(chromeStorage, function() {});
      // };
      // setIframeData();
    });
  });
};

$(document).ready(function(){
  client.authenticate({interactive:false}, function (error) {
    if (error) {
      alert('Authentication error: ' + error);
      client.reset();
    }
    chrome.commands.onCommand.addListener(function(command) {
          appController.toggleSidePanel();
    });
  });
});
