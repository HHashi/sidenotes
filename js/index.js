$(document).ready(function(){
  var backgroundPage = chrome.extension.getBackgroundPage();
  var datastoreManager = backgroundPage.client.getDatastoreManager();
  datastoreManager.close();
  datastoreManager.openDefaultDatastore(function (error, datastore) {

    var currentTable = datastore.getTable('stuff');
    var allRecords = currentTable.query();
    var formattedRecords = [];

    //Formats records for Search
    for(var i=0;i<allRecords.length;i++){
      var eachNote = {};
      eachNote['url'] = allRecords[i].get('url');
      eachNote['body'] = allRecords[i].get('body');
      formattedRecords[i] = eachNote;
    }

    var fuse = new Fuse(formattedRecords, { keys: ["url", "body"] });

    displayResults(formattedRecords);

    $('#note-search').on('keyup', function(){
       var results = fuse.search($('#note-search').val());
      if (results === []){
        displayResults(formattedRecords);
      } else {
        displayResults(results);
      }
    });

    $('#note-search').on('keyup', function(){
      if ($('#note-search').val() === ""){ displayResults(formattedRecords); }
    });

    document.getElementById('note-search').addEventListener('search', function(){
      if ($('#note-search').val() === ""){ displayResults(formattedRecords); }
    });

    function displayResults(list){
      $('#search-results').empty();
      for(var i=0;i<list.length;i++){
        var eachNote = '<li><a href='+list[i].url+'></a>'+ list[i].url +'<br>'+list[i].body+'</li>';
        $('#search-results').append(eachNote);
      }
    }
  });
});