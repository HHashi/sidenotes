document.addEventListener( "DOMContentLoaded", function(){

  var appController = chrome.extension.getBackgroundPage().appController;

  document.querySelector("#note-search").addEventListener('keyup', function(){
    var searchParams = document.querySelector("#note-search").value;
    var results = fuse.search(searchParams);
    if (searchParams === ""){
      displayResults(formattedRecords);
    } else {
      displayResults(results);
    }
  });

  document.querySelector('.dropbox-signout').addEventListener('click', function(e){
    e.preventDefault();
    appController.signOut();
    window.close();
  });

  document.querySelector('#note-search').addEventListener('search', function(){
    if (document.querySelector("#note-search").value === ""){ displayResults(formattedRecords); }
  });

  var backgroundPage = chrome.extension.getBackgroundPage();
  var allRecords = backgroundPage.currentTable.query();
  var formattedRecords = formatNotes(allRecords, 'date', 'url', 'body');

  var fuse = new Fuse(formattedRecords, { keys: ["url", "body"] });
  displayResults(formattedRecords);

  var noteLinks = document.querySelectorAll(".note-url");
  addActionToNoteLink(noteLinks);

  function addActionToNoteLink(noteLinks){
    for(var i=0;i<noteLinks.length;i++){
      noteLinks[i].addEventListener('click', function(e) {
        e.preventDefault();
        chrome.tabs.create({url: this.getAttribute('href')}, function(tab){
          backgroundPage.appController.toggleSidePanel();
        });
      });
    }
  }
});

function displayResults(list){
  var notes = "";
  var noteSearchList = document.querySelector('#search-results');
  noteSearchList.innerHTML = "";

  for(var i=0;i<list.length;i++){
    notes += renderNote(list[i]);
  }
  noteSearchList.innerHTML = notes;
}

function renderNote(note){
  return '<li>'
    + '<span class="note-date">' + note.date.toLocaleString()
    + '</span>'
    + '<a class="note-url" href=' + note.url
    + ' target="_blank" title="' + note.url + '">'
    + '<i class="icon-link-ext"></i>'
    + '</a>'
    + '<p class="note-body">' + JSON.parse(note.body) + '</p>'
    + '</li>';
}

function formatNotes(records, date, attr1, attr2 ){
  var notes = [];
  for(var i=0;i<records.length;i++){
    var eachNote = {};
    eachNote[date] = new Date(records[i].get(date));
    eachNote[attr1] = records[i].get(attr1);
    eachNote[attr2] = records[i].get(attr2);
    notes[i] = eachNote;
  }
  return  notes.reverse();
}
