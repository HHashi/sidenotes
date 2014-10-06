document.addEventListener( "DOMContentLoaded", function(){
  var backgroundPage = chrome.extension.getBackgroundPage();
  var appController = backgroundPage.appController;
  var hashConverter = new Hashes.SHA1;;

  document.querySelector("#note-search").addEventListener('keyup', function(){
    var searchParams = document.querySelector("#note-search").value;
    if (searchParams === ""){
      displayResults(formattedRecords, addActionToNoteLink);
    } else {
      var results = fuse.search(searchParams);
      displaySearchResults(results, addActionToNoteLink);
    }
  });

  document.querySelector('.dropbox-signout').addEventListener('click', function(e){
    e.preventDefault();
    appController.signOut();
    window.close();
  });

  document.querySelector('#note-search').addEventListener('search', function(){
    if (document.querySelector("#note-search").value === ""){ displayResults(formattedRecords, addActionToNoteLink); }
  });

  var allRecords = backgroundPage.currentTable.query();
  var formattedRecords = formatNotes(allRecords);

  var options = {
    caseSensitive: false,
    includeScore: true,
    shouldSort: true,
    keys: ["url", "body"]
  };

  var fuse = new Fuse(formattedRecords, options);
  setAllNotes();

  function addActionToNoteLink(){
    linkToNoteUrl();
    deleteNoteListener();
  }

  function linkToNoteUrl(){
    var noteLinks = document.querySelectorAll(".note-url");
    for(var i=0;i<noteLinks.length;i++){
      noteLinks[i].addEventListener('click', function(e) {
        e.preventDefault();
        chrome.tabs.create({url: this.getAttribute('href')}, function(tab){
          appController.toggleSidePanel();
        });
      });
    }
  }

  function deleteNoteListener(){
    var deleteButtons = document.querySelectorAll('.delete-note');
    for(var i=0;i<deleteButtons.length;i++){
      deleteButtons[i].addEventListener('click', function(e) {
        e.preventDefault();
        var localNoteToDelete = chrome.storage.local.remove(hashConverter.hex(this.getAttribute('href')), function(){})
        var noteToDelete = backgroundPage.currentTable.query({url: this.getAttribute('href')});
        deleteNote(noteToDelete);
      });
    }
  }

  function setAllNotes(){
    allRecords = chrome.extension.getBackgroundPage().currentTable.query();
    formattedRecords = formatNotes(allRecords, 'date', 'url', 'body');
    displayResults(formattedRecords, addActionToNoteLink);
  }

  backgroundPage.openDatastore.recordsChanged.addListener(function(event) {
    allRecords = chrome.extension.getBackgroundPage().currentTable.query();
    formattedRecords = formatNotes(allRecords);
    fuse = new Fuse(formattedRecords, options);
    setAllNotes();
  });

  function deleteNote(note){
    var result = confirm("Are you sure you want to delete this message?");
    if (result === true && note[0]) {
      note[0].deleteRecord();
    }
  }
});

function displayResults(list, callback){
  var notes = "";
  var noteSearchList = document.querySelector('#search-results');
  noteSearchList.innerHTML = "";

  for(var i=0;i<list.length;i++){
    notes += renderNote(list[i]);
  }
  noteSearchList.innerHTML = notes;
  callback();
}

function displaySearchResults(list, callback){
  var notes = "";
  var noteSearchList = document.querySelector('#search-results');
  noteSearchList.innerHTML = "";

  for(var i=0;i<list.length;i++){
    notes += renderSearchNotes(list[i]);
  }
  noteSearchList.innerHTML = notes;
  callback();
}

function renderNote(note){
  var domain = note.url.match(/(?:https?:\/\/)?(?:www\.)?(.*?)\//);
  var truncated_domain = domain[domain.length-1].substring(0,30);

  return '<li>'
          + '<div class="note-header">'
            + '<div class="note-header-left">'
              + '<a class="note-url" href=' + note.url
              + ' target="_blank" title="' + note.url + '">'
              + '<i class="icon-external"></i> ' + truncated_domain + '</a>'
            + '</div>'
            + '<div class="note-header-right">'
              + '<span class="note-date">' + note.updatedAt.toLocaleDateString() + '</span>'
              + '<br>'
              + '<a href="' + note.url
              + '" class="delete-note"><i class="icon-cancel"></i>delete</a>'
            + '</div>'
          + '</div>'
          + '<p class="note-body">' + JSON.parse(note.body) + '</p>'
        + '</li>';
}

function renderSearchNotes(note) {
  var domain = note['item']['url'].match(/(?:https?:\/\/)?(?:www\.)?(.*?)\//);
  var truncated_domain = domain[domain.length-1].substring(0,30);

  return '<li>'
          + '<div class="note-header">'
            + '<div class="note-header-left">'
              + '<a class="note-url" href=' + note['item']['url']
              + ' target="_blank" title="' + note['item']['url'] + '">'
              + '<i class="icon-external"></i> ' + truncated_domain + '</a>'
              + '<br>'
              + '<span class="note-score">'
                + Math.floor((100 - note['score'] * 100)).toString()
              + '% match</span>'
            + '</div>'
            + '<div class="note-header-right">'
              + '<span class="note-date">' + note['item']['updatedAt'].toLocaleDateString() + '</span>'
              + '<br>'
              + '<a href="' + note.url
              + '" class="delete-note"><i class="icon-cancel"></i>delete</a>'
            + '</div>'
          + '</div>'
          + '<p class="note-body">' + JSON.parse(note['item']['body']) + '</p>'
        + '</li>';
}

function formatNotes(records){
  var notes = [];
  for(var i=0;i<records.length;i++){
    var eachNote = {};
    eachNote['createdAt'] = new Date(records[i].get('createdAt'));
    eachNote['updatedAt'] = new Date(records[i].get('updatedAt'));
    eachNote['url'] = records[i].get('url');
    eachNote['body'] = records[i].get('body');
    notes[i] = eachNote;
  }
  return  notes.reverse();
}
