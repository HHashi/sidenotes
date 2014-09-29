var DROPBOX_APP_KEY = 'e4fbthwtr2v9ksp';

var currentTable;

var client = new Dropbox.Client({key: DROPBOX_APP_KEY});

client.onAuthStepChange.addListener(function(event) {
  if (client.isAuthenticated()) {
    chrome.commands.onCommand.addListener(function(command) {
      appController.toggleSidePanel();
    });
    initDatastore();
  }
});

client.authenticate({interactive:false}, function (error) {
  if (error) {
    alert('Authentication error: ' + error);
    client.reset();
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
  }
};

function initDatastore(){
  client.getDatastoreManager().openDefaultDatastore(function (error, datastore) {

    if (error) {
      console.log('Error opening default datastore: ' + error);
    }

    // Open table in datastore
    currentTable = datastore.getTable('sideNotes');

    // Listen for changes from iframe and push to datastore
    chrome.storage.onChanged.addListener(function(changes, namespace) {
      if(changes['iframeNote']) {
        chrome.storage.local.get(null, function(result){ })
        currentTable.insert({
          url: changes['iframeNote']['newValue']['url'],
          body: changes['iframeNote']['newValue']['body'],
          date: changes['iframeNote']['newValue']['date']
        });
      };
    });

    // Add event listener for changed records (local and remote)
    datastore.recordsChanged.addListener(function(event) {
      var changedRecords = event.affectedRecordsForTable(currentTable._tid);
      var dbRecord = changedRecords[0];
      var chromeStorage = {};

      chromeStorage['backgroundNote'] = { 'url': dbRecord.get('url'), 'body': dbRecord.get('body'), 'date': dbRecord.get('date') }
      chrome.storage.local.set(chromeStorage, function() {});
    });
  });
};
