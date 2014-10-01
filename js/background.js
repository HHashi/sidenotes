function trace(name, val){
  var args = (val === undefined) ? [name] : [name, val]
  console.log.apply(console, args)
}

// ---

trace('event:start')

var DROPBOX_APP_KEY = 'e4fbthwtr2v9ksp';

var currentTable;

var client = new Dropbox.Client({key: DROPBOX_APP_KEY});

client.onAuthStepChange.addListener(function(event) {
  trace('event:auth/step-change')
  if (client.isAuthenticated()) {
    trace('event:auth/authenticated')
    initDatastore(datastoreController.syncRemoteStorage);
  }
});

trace('event:auth/start')
client.authenticate({interactive:false}, function (error) {
  trace('event:auth/response')
  if (error) {
    trace('event:auth/response/error')
    alert('Authentication error: ' + error);
    client.reset();
  }
  trace('event:auth/end')
});

// needs to be global?
appController = {
  isAuthenticated: function(){
    return client.isAuthenticated();
  },
  authenticate: function(){
    client.authenticate(function(error){
      if(error){
        client.reset();
      } else {
        window.open('http://sidenotes.co/tutorial.html'); // Opens Tutorial Page
      }
    });
  },
  signOut: function(){
    client.signOut(null, function(){
      client.reset();
      chrome.tabs.query( {} ,function (tabs) { // The Query {} was missing here
        for (var i = 0; i < tabs.length; i++) {
          chrome.tabs.executeScript(tabs[i].id, {code: 'var sidebar = document.querySelector("#sidenotes_sidebar");document.body.removeChild(sidebar);'});
        }
      });

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
    console.log("noteData", noteData[noteUrl]['date'])
    return {
        url: noteUrl,
        body: noteData[noteUrl]['body'],
        date: new Date(JSON.parse(noteData[noteUrl]['date']))
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
        note[newNote.get('url')] = {'date': JSON.stringify(newNote.get('date')), 'body':newNote.get('body')};
        allLocalNotes[i] = note;
        break;
      } else if (i === allLocalNotes.length-1){
        var note = {};
        note[newNote.get('url')] = {'date': JSON.stringify(newNote.get('date')), 'body':newNote.get('body')};
        allLocalNotes.push(note);
      }
    }

    return newLocalStorage;
  },
  syncRemoteStorage: function(currentTable){
    var datastoreRecords = currentTable.query();
    chrome.storage.local.get(null, function(result){
      if(typeof(result['sidenotes']) === 'object'){

        var mergedNotes = datastoreController.getConcurrentNotes(datastoreRecords, result['sidenotes']);
        chrome.storage.local.set({'sidenotes': mergedNotes }, function(){});
      } else {
        chrome.storage.local.set({'sidenotes': []}, function(){});
        datastoreController.syncRemoteStorage(currentTable);
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
            note[noteUrl] = {'date': JSON.stringify(datastoreRecords[i].get('date')), 'body':datastoreRecords[i].get('body')};
            newNoteList.push(note);
          }
        }
      } else {
        var note = {};
        note[noteUrl] = {'date': JSON.stringify(datastoreRecords[i].get('date')), 'body':datastoreRecords[i].get('body')};
        newNoteList.push(note);
      }
    }
    return newNoteList;
  },
  mergeNotes: function(remoteRecord, localRecord, newNoteList){
    var remoteDate = remoteRecord.get('date');
    var noteUrl = remoteRecord.get('url');
    var localDate = new Date(JSON.parse(localRecord[noteUrl]['date']));
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
    if(!oldNoteList){
      return
    }
    for(var i=0;i<oldNoteList.length;i++){
      var noteKey = Object.keys(oldNoteList[i])[0];
      if(newNoteList[i][noteKey]['body'] !== oldNoteList[i][noteKey]['body'] ){
        return newNoteList[i];
      }
    }
  }
};

function initDatastore(callback){
  trace('event:remote-store/connecting')
  client.getDatastoreManager().openDefaultDatastore(function (error, datastore) {
    trace('event:remote-store/connected')
    if (error) {
      trace('event:remote-store/connect/error')
      console.log('Error opening default datastore: ' + error);
    }
    // Open table in datastore
    // needs to be global?
    currentTable = datastore.getTable('Sidenotes');

    // Listen for changes from iframe and push to datastore
    chrome.storage.onChanged.addListener(function(changes, namespace) {
      if(changes['sidenotes']){
        trace('event:note/updated-from-iframe', changes['sidenotes'])
        var newNote = datastoreController.getChangedValue(changes['sidenotes']['newValue'], changes['sidenotes']['oldValue']);
        if(typeof(newNote) === 'object'){
          var existingRecord = currentTable.query({url: Object.keys(newNote)[0] });
          trace('state:note/exists-in-remote-store', [url, !!existingRecord])
          datastoreController.updateOrAddRecord(newNote, existingRecord[0]);
        }
      }
    });

    function setBackgroundNoteToChromeStorage(record) {
      var chromeStorage = {};

      chromeStorage['backgroundNote'] = { 'url': record.get('url'), 'body': record.get('body'), 'date': record.get('date') }
      chrome.storage.local.set(chromeStorage, function() {});
    };

    // Add listener for changed records on datastore
    // todo: move up above fn declarations
    datastore.recordsChanged.addListener(function(event) {
      trace('event:remote-store/changed')
      var changedRecords = event.affectedRecordsForTable(currentTable._tid);
      trace('invariant:remote-store/changed/record', changedRecords[0])
      setBackgroundNoteToChromeStorage(changedRecords[0]);
    });
  });
};
