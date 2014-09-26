// Create DropBox Client for App
var client = new Dropbox.Client({key: 'e4fbthwtr2v9ksp'});

var prependNotes = function(notesArray) {
  for(i = 0; i < notesArray.length; i++) {
    $('#noteslist').prepend('<li>' + notesArray[i].get('body') + '</li>');
  }
};

$(document).ready(function() {
  // User authenticates his Dropbox
  client.authDriver(new Dropbox.AuthDriver.ChromeExtension({
        receiverPath: "html/chrome_oauth_receiver.html"
        })
    );

    client.authenticate(function(error, client) {
        if (error) {
          return console.log(error);
        }
        console.log(client.credentials());
    });

  // Clears user auth token
  $('#dplogout').on('click', function(){
    client.signOut();
  });

  // Check is user is authenticated
  if (client.isAuthenticated()) {

    console.log('Auth success, User: ' + client.dropboxUid());

    // Create default datastore for user
    var datastoreManager = client.getDatastoreManager();
    datastoreManager.openDefaultDatastore(function (error, datastore) {

      if (error) {
        alert('Error opening default datastore: ' + error);
      };

      // Create tabled called notes in default datastore
      var notesTable = datastore.getTable('notes');
      console.log(notesTable._tid + ' table', notesTable);

      // Retrieve array of all notes
      var results = notesTable.query();
      console.log('all notes', results);
      console.log('first note', results[0]);

      // Append notes to list
      prependNotes(results);

      // Create note from form input
      $('#createnote').on('submit', function(e){
        e.preventDefault();
        var noteBody = $('#createnote textarea').val();
        var note = notesTable.insert({
          body: noteBody,
          created: new Date()
        });
        console.log('created note', note);
        $('#createnote').trigger('reset');
      });

      // Add event listener for changed records (local and remote)
      datastore.recordsChanged.addListener(function (event) {
        var changedRecords = event.affectedRecordsForTable('notes');
        console.log('records changed: ', changedRecords);
        prependNotes(changedRecords);
      });

    });
  }
});
