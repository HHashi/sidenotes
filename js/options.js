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
  var formattedRecords = formatNotes(allRecords, 'date', 'url', 'body');

  var fuse = new Fuse(formattedRecords, { keys: ["url", "body"] });
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

  var domain = note.url.match(/(?:https?:\/\/)?(?:www\.)?(.*?)\//);
  var truncated_domain = domain[domain.length-1].substring(0,30);

  return '<li>'
  + '<span class="note-date">' + note.date.toLocaleDateString() + '</span>'
  + '<a class="note-url" href=' + note.url
  + ' target="_blank" title="' + note.url + '">'
  + '<i class="icon-link-ext"></i> ' + truncated_domain + '</a>'
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
