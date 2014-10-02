var DROPBOX_APP_KEY = 'e4fbthwtr2v9ksp';

var currentTable, openDatastore;

var client = new Dropbox.Client({key: DROPBOX_APP_KEY});
var hashConverter = new Hashes.SHA1;;

client.onAuthStepChange.addListener(function(event) {
  if (client.isAuthenticated()) {
    initDatastore(datastoreController.syncRemoteStorage);
  }
});

client.authenticate({interactive:false}, function (error) {
  if (error) {
    client.reset();
  }
});

appController = {
  isAuthenticated: function(){
    return client.isAuthenticated();
  },
  authenticate: function(){
    client.authenticate(function(error){
      if(error){
        client.reset();
      } else {
        chrome.tabs.create({url: "http://sidenotes.co/tutorial.html"}, function(tab){
          appController.toggleSidePanel();});
      };
    });
  },
  signOut: function(){
    client.signOut(null, function(){
      client.reset();
      appController.closeAllSidePanels();
    });
  },
  closeAllSidePanels: function(){
    chrome.tabs.query( {} ,function (tabs) {
      for (var i = 0; i < tabs.length; i++) {
        chrome.tabs.executeScript(tabs[i].id, {code: 'var sidebar = document.querySelector("#sidenotes_sidebar");document.body.removeChild(sidebar);'});
      }
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
  }
};

datastoreController = {
  updateOrAddRecord: function(newNote, pastNote, hashKey){
    var newNoteData = this.makeRecord(newNote[hashKey]);
    if(pastNote) {
      pastNote.update(newNoteData);
    } else {
      currentTable.insert(newNoteData);
    }
  },
  makeRecord: function(noteData){
    return {
        url: noteData['newValue']['url'],
        body: noteData['newValue']['body'],
        createdAt: new Date(JSON.parse(noteData['newValue']['createdAt'])),
        updatedAt: new Date()
    };
  },
  setRemoteNoteToLocalStorage: function(newRemoteNote) {
    chrome.storage.local.get(null, function(result){
        var newLocalNotes = datastoreController.mergeNotes([newRemoteNote]);
    });
  },
  syncRemoteStorage: function(currentTable){
    chrome.storage.local.set({saving: 'false'}, function(){});
    var datastoreRecords = currentTable.query();
    if(datastoreRecords){
      chrome.storage.local.get(null, function(result){
          datastoreController.mergeNotes(datastoreRecords, result);
      });
    }
  },
  mergeNotes: function(datastoreRecords, chromeLocalRecords){
    if(chromeLocalRecords){
      for (var i=0;i<datastoreRecords.length;i++) {
        var noteKey = hashConverter.b64(datastoreRecords[i].get('url'));
        console.log(chromeLocalRecords);
        var localMatchNote = chromeLocalRecords[noteKey];
        var newNote = {};
        if(localMatchNote){
          if(localMatchNote['body'] !== datastoreRecords[i].get('body')){
            newNote[noteKey] = datastoreController.formatForLocalStorage(datastoreRecords[i]);
            chrome.storage.local.set(newNote, function(){});
          }
        } else {
          newNote[noteKey] = datastoreController.formatForLocalStorage(datastoreRecords[i]);
          chrome.storage.local.set(newNote, function(){});
        }
      }
    }
    chrome.storage.local.set({saving: 'true'}, function(){});
  },
  formatForLocalStorage: function(noteData){
    return {'url': noteData.get('url'), 'body': noteData.get('body'), 'createdAt': JSON.stringify(noteData.get('createdAt')), 'updatedAt': JSON.stringify(new Date())};
  }
};


function initDatastore(callback){
  client.getDatastoreManager().openDefaultDatastore(function (error, datastore) {
    if (error) {
      console.log('Error opening default datastore: ' + error);
    }

    openDatastore = datastore;
    currentTable = datastore.getTable('Sidenotes');

    chrome.storage.onChanged.addListener(function(changes, namespace) {
      if(!changes['saving']){
        var hashKey = Object.keys(changes)[0];
        console.log(changes)
        var existingRecord = currentTable.query({url: changes[hashKey]['newValue']['url'] });
        datastoreController.updateOrAddRecord(changes, existingRecord[0], hashKey);
      }
    });

    datastore.recordsChanged.addListener(function(event) {
      chrome.storage.local.set({saving: 'false'}, function(){});
      var changedRecords = event.affectedRecordsForTable(currentTable._tid);
      datastoreController.setRemoteNoteToLocalStorage(changedRecords[0]);
    });
    callback(currentTable);
  });
};