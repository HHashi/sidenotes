var DROPBOX_APP_KEY = 'e4fbthwtr2v9ksp';

var currentTable;

var client = new Dropbox.Client({key: DROPBOX_APP_KEY});

client.onAuthStepChange.addListener(function(event) {
  if (client.isAuthenticated()) {
    chrome.commands.onCommand.addListener(function(command) {
      appController.toggleSidePanel();
    });
    initDatastore();
    datastoreController.syncRemoteStorage();
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
  }
};

datastoreController = {
  updateOrAddRecord: function(newNote, pastNote){
    var newNoteData = this.makeRecord(newNote['newValue']);
    if(pastNote) {
      pastNote.update(newNoteData);
    } else {
      currentTable.insert(newNoteData);
    }
  },
  makeRecord: function(noteData){
    return {
        url: noteData['url'],
        body: noteData['body'],
        date: new Date(JSON.parse(noteData['date']))
    };
  },
  setRemoteNoteToLocalStorage: function(newRemoteNote) {
    chrome.storage.local.get(null, function(result){
      var newLocalNotes = datastoreController.addNoteToLocal(newRemoteNote, result['sidenotes']);
      console.log(result['sidenotes'])
      chrome.storage.local.set({'sidenotes': result['sidenotes'].concat(newLocalNotes) }, function() {});
    });

  },
  addNoteToLocal: function(newNote, allLocalNotes){
    var newLocalStorage = [];
    console.log(newNote.get('url'));
    for(var i=0;i<allLocalNotes.length;i++){
      if(newNote.get('url') == Object.keys(allLocalNotes[i])[0]){
        var note = {};
        note[newNote.get('url')] = {'date': newNote.get('date'), 'body':newNote.get('body')};
        allLocalNotes[i] = note;
      }
    }
    console.log('This is newLocalStorage:', newLocalStorage)
    return newLocalStorage;
  },
  syncRemoteStorage: function(){
    var datastoreRecords = currentTable.query();
    chrome.storage.local.get(null, function(result){
      if(typeof(result['sidenotes']) === 'object'){
        var mergedNotes = datastoreController.getConcurrentNotes(datastoreRecords, result['sidenotes']);
        chrome.storage.local.set({'sidenotes': mergedNotes }, function(){});
      } else {
        chrome.storage.local.set({'sidenotes': []}, function(){});
      }
    });
  },
  getConcurrentNotes: function(datastoreRecords, chromeLocalRecords){
    var newNoteList = [];
    for (var i=0;i<datastoreRecords.length;i++) {
      var noteUrl = datastoreRecords[i].get('url');
      if(chromeLocalRecords[0]){
        for(var i=0;i<chromeLocalRecords.length;i++){
          if(noteUrl === toString(Object.keys(chromeLocalRecords[i])[0])){
            this.mergeNotes(datastoreRecords[i], chromeLocalRecords[i], chromeLocalRecords);
          } else {
            var note = {};
            note[noteUrl] = {'date': datastoreRecords[i].get('date'), 'body':datastoreRecords[i].get('body')};
            newNoteList.push(note);
          }
        }
      } else {
        var note = {};
        note[noteUrl] = {'date': datastoreRecords[i].get('date'), 'body':datastoreRecords[i].get('body')};
        newNoteList.push(note);
      }
    };
    return newNoteList;
  },
  mergeNotes: function(remoteRecord, localRecord, allLocalRecords){
    var remoteDate = remoteRecord.get('date');
    var localDate = new Date(JSON.parse(localRecords['date']));
    var noteURL = remoteRecord.get('url');
    if(remoteDate.getTime() > localDate.getTime()){
      chromeLocalRecords = {noteUrl: {'date': remoteRecord.get('date'), 'body':remoteRecord.get('body')}};
    }
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
        datastoreController.updateOrAddRecord(currentTable, changes['sidepanelNote'], existingRecord[0]);
      }
    });

    // Add listener for changed records on datastore
    datastore.recordsChanged.addListener(function(event) {
      var changedRecords = event.affectedRecordsForTable(currentTable._tid);
      setBackgroundNoteToChromeStorage(changedRecords[0]);
    });
  });
};
