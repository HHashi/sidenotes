// Create DropBox Client for App
var client = new Dropbox.Client({key: 'APP_KEY'});

$(document).ready(function() {

  // Authenticate App in the background
  client.authenticate({interactive: false}, function (error) {
    if (error) {
        alert('Authentication error: ' + error);
    }
  });

  // User authenticates his Dropbox
  $('#dpauth').on('click', function(){
    client.authenticate();
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
      console.log('all notes', results)
      console.log('first note', results[0])

      // Create note from form input
      $('#createnote').on('submit', function(e){
        e.preventDefault();
        console.log('note body: ', $(this).serialize());
        var noteBody = $(this).serialize();
        var note = notesTable.insert({
          body: noteBody,
          created: new Date()
        });
        console.log('created note', note);
        console.log('new first note', results[0])
      });

      // Add event listener for changed records (local and remote)
      datastore.recordsChanged.addListener(function (event) {
          console.log('records changed: ', event.affectedRecordsForTable('notes'));
      });

    });
  };
});
