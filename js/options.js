document.addEventListener( "DOMContentLoaded", function(){

  var appController = chrome.extension.getBackgroundPage().appController;

  document.querySelector("#note-search").addEventListener('keyup', function(){
    var searchParams = document.querySelector("#note-search").value;
    if (searchParams === ""){
      displayResults(formattedRecords, addActionToNoteLink);
    } else {
      var results = fuse.search(searchParams);
      displayResults(results, addActionToNoteLink);
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

  var allRecords = chrome.extension.getBackgroundPage().currentTable.query();
  var formattedRecords = formatNotes(allRecords, 'date', 'url', 'body', 'score');

  var options = {
    caseSensitive: false,
    includeScore: true,
    shouldSort: true,
    threshold: 0.6,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    keys: ["url", "body"]
  };
  var fuse = new Fuse(formattedRecords, options);
  displayResults(formattedRecords, addActionToNoteLink);

  function addActionToNoteLink(){
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

function renderNote(note){
  return '<li>'
    + '<span class="note-date">' + note.date.toLocaleString()
    + '</span>'
    // if () {
    //   + '<span class="note-date">' + note.score
    //   + '</span>'
    //   // + searching() +
    // }
    + '<a class="note-url" href=' + note.url
    + ' target="_blank" title="' + note.url + '">'
    + '<i class="icon-link-ext"></i>'
    + '</a>'
    + '<p class="note-body">' + JSON.parse(note.body) + '</p>'
    + '</li>';
}

function formatNotes(records, date, url, body, score ){
  var notes = [];
  for(var i=0;i<records.length;i++){
    var eachNote = {};
    eachNote[date] = new Date(records[i].get(date));
    eachNote[url] = records[i].get(url);
    eachNote[body] = records[i].get(body);
    eachNote[score] = records[i][score];
    notes[i] = eachNote;
  }
  return  notes.reverse();
}