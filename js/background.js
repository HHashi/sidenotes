var DROPBOX_APP_KEY = 'e4fbthwtr2v9ksp';

var currentTable;

var client = new Dropbox.Client({key: DROPBOX_APP_KEY});

client.onAuthStepChange.addListener(function(event) {
  if (client.isAuthenticated()) {
    chrome.commands.onCommand.addListener(function(command) {
      appController.toggleSidePanel();
    });
    initDatastore();
    //TODO FIX Below
    setTimeout(function(){datastoreController.syncRemoteStorage()}, 1000);
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
    var newNoteData = this.makeRecord(newNote);
    if(pastNote) {
      pastNote.update(newNoteData);
    } else {
      currentTable.insert(newNoteData);
    }
  },
  makeRecord: function(noteData){
    var noteUrl = Object.keys(noteData)[0];
    return {
        url: noteUrl,
        body: noteData[noteUrl]['body'],
        date: currentDate
    };
  },
  setRemoteNoteToLocalStorage: function(newRemoteNote) {
    chrome.storage.local.get(null, function(result){
      var newLocalNotes = datastoreController.addNoteToLocal(newRemoteNote, result['sidenotes']);
      chrome.storage.local.set({'sidenotes': result['sidenotes'].concat(newLocalNotes) }, function() {});
    });

  },
  addNoteToLocal: function(newNote, allLocalNotes){
    var newLocalStorage = [];
    for(var i=0;i<allLocalNotes.length;i++){
      if(newNote.get('url') == Object.keys(allLocalNotes[i])[0]){
        var note = {};
        note[newNote.get('url')] = {'date': newNote.get('date'), 'body':newNote.get('body')};
        allLocalNotes[i] = note;
        break;
      } else if (i === allLocalNotes.length-1){
        var note = {};
        note[newNote.get('url')] = {'date': newNote.get('date'), 'body':newNote.get('body')};
        allLocalNotes.push(note);
      }
    }

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
      if(chromeLocalRecords.length>0){
        for(var j=0;j<chromeLocalRecords.length;j++){
          if(noteUrl == Object.keys(chromeLocalRecords[j])[0]){
             console.log(datastoreRecords[i].get('date'));
            newNoteList = this.mergeNotes(datastoreRecords[i], chromeLocalRecords[j], newNoteList);
            break;
          } else if (j === chromeLocalRecords.length-1){
            var note = {};
            console.log('Datastore date', datastoreRecords[i].get('date'))
            note[noteUrl] = {'date': datastoreRecords[i].get('date'), 'body':datastoreRecords[i].get('body')};
            newNoteList.push(note);
          }
        }
      } else {
        var note = {};
        note[noteUrl] = {'date': datastoreRecords[i].get('date'), 'body':datastoreRecords[i].get('body')};
        newNoteList.push(note);
      }
    }
    return newNoteList;
  },
  mergeNotes: function(remoteRecord, localRecord, newNoteList){
    var remoteDate = remoteRecord.get('date');
    var localDate = new Date(localRecord['date']);
    console.log(remoteDate);
    console.log(localDate);
    var noteUrl = remoteRecord.get('url');
    if(remoteDate.getTime() > localDate.getTime()){
      var note = {};
      note[noteUrl] = {'date': JSON.stringify(remoteDate), 'body': remoteRecord.get('body')};
      newNoteList.push(note);
      return newNoteList;
    } else {
      var note = {};
      note[noteUrl] = {'date': JSON.stringify(localDate), 'body': localRecord[noteUrl]['body']};
      newNoteList.push(note);
      return newNoteList;
    }
  },
  getChangedValue: function(newNoteList, oldNoteList){
    for(var i=0;i<oldNoteList.length;i++){
      var noteKey = Object.keys(oldNoteList[i])[0];
      if(newNoteList[i][noteKey]['body'] !== oldNoteList[i][noteKey]['body'] ){
        return newNoteList[i];
      }
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
      if(changes['sidenotes']){
        var newNote = datastoreController.getChangedValue(changes['sidenotes']['newValue'], changes['sidenotes']['oldValue']);
        if(typeof(newNote) === 'object'){
          var existingRecord = currentTable.query({url: Object.keys(newNote)[0] });
          datastoreController.updateOrAddRecord(newNote, existingRecord[0]);
        }
      }
    });
    // Add listener for changed records on datastore
    datastore.recordsChanged.addListener(function(event) {
      var changedRecords = event.affectedRecordsForTable(currentTable._tid);
      datastoreController.setRemoteNoteToLocalStorage(changedRecords[0]);
    });
  });
};