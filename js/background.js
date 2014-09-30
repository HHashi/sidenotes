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
      var sidebar = document.querySelector("#sidenotes_sidebar");
      document.body.removeChild(sidebar);
    };

    var openSidePanel = function(){
      var currentUrl = window.location.toString();
      var newElement = document.createElement("iframe");
      newElement.setAttribute("id", "sidenotes_sidebar");
      newElement.setAttribute("src", "chrome-extension://afbonmgmjbiofanjpldocnjbdkpeodbj/html/sidepanel.html#" + currentUrl);
      newElement.setAttribute("style", "z-index: 999999999999999; position: fixed; top: 0px; right: 0px; bottom: 0px; width: 300px; height: 100%; border:0; border-left: 1px solid #eee; box-shadow: 0px -1px 7px 0px #aaa; overflow-x: hidden;");
      newElement.setAttribute("allowtransparency", "false");
      newElement.setAttribute("scrolling", "no");
      document.body.appendChild(newElement);
    };

    if (document.querySelector("#sidenotes_sidebar")) {
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
  updateOrAddRecord: function(newNote, pastNote){
    var newNoteData = this.makeRecord(newNote['newValue']);
    if(pastNote) {
      pastNote.update(newNoteData);
    } else {
      currentTable.insert(newNoteData);
    }
  },
  makeRecord: function (noteData){
    return {
        url: noteData['url'],
        body: noteData['body'],
        date: new Date(JSON.parse(noteData['date']))
    };
  }
};

function initDatastore(){
  client.getDatastoreManager().openDefaultDatastore(function (error, datastore) {
    if (error) {
      console.log('Error opening default datastore: ' + error);
    }

    // Open table in datastore
    currentTable = datastore.getTable('Sidenotes');

    // Listen for changes from iframe and push to datastore
    chrome.storage.onChanged.addListener(function(changes, namespace) {
      if(changes['sidepanelNote']){
        var existingRecord = currentTable.query({url: changes['sidepanelNote']['newValue']['url']});
        updateOrAddRecord(changes['sidepanelNote'], existingRecord[0]);
      }
    });

    function updateOrAddRecord(newNote, pastNote){
      var existingRecord = currentTable.query({url: newNote['newValue']['url']});
      var newNoteData = {
          url: newNote['newValue']['url'],
          body: newNote['newValue']['body'],
          date: new Date(JSON.parse(newNote['newValue']['date']))
      };
      if(pastNote) {
        pastNote.update(newNoteData);
      } else {
        currentTable.insert(newNoteData);
      }
    };

    function setBackgroundNoteToChromeStorage(record) {
      var chromeStorage = {};

      chromeStorage['backgroundNote'] = { 'url': record.get('url'), 'body': record.get('body'), 'date': record.get('date') }
      chrome.storage.local.set(chromeStorage, function() {});
    };

    // Add listener for changed records on datastore
    datastore.recordsChanged.addListener(function(event) {
      var changedRecords = event.affectedRecordsForTable(currentTable._tid);
      setBackgroundNoteToChromeStorage(changedRecords[0]);
    });
  });
};
