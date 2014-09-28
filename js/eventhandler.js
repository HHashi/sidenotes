$(document).ready(function(){

  var backgroundPage = chrome.extension.getBackgroundPage();
  var appController = backgroundPage.appController;

  backgroundPage.client.authenticate({interactive:false}, function (error) {
    if (error) {
      alert('Authentication error: ' + error);
      client.reset();
    }
  });

  $('#dropbox-signin').click(function() {
    appController.authenticate();
  });

  $('#dropbox-signout').click(function() {
    appController.signOut();
    $('#loggedinfo').hide();
    $('#loggedin').hide();
    $('#dropbox-signin').show();
  });

  if (appController.isAuthenticated()) {
    $('#loggedinfo').show();
    $('#loggedin').show();
    window.close();
    $('#dropbox-signin').hide();
    appController.toggleSidePanel();
  }


// TODO REFACTOR BELOW
// ===============================================================

  var getLastNote = function(allNotes) {
    return allNotes[allNotes.length - 1];
  };

  var updateNoteInfo = function(table) {
    var allRecords = table.query();
    if (allRecords.length > 0) {
      $('#textarea').text(getLastNote(allRecords).get('body'));
      $('#lastnoteinfo span').text(getLastNote(allRecords).get('body'));
      $('#recordscount span').text(allRecords.length);
    }
  };

  // Open default datastore for current user
  datastoreManager = backgroundPage.client.getDatastoreManager();
  datastoreManager.close();
  datastoreManager.openDefaultDatastore(function (error, datastore) {

    if (error) {
      console.log('Error opening default datastore: ' + error);
    }

    // Open table in datastore
    var currentTable = datastore.getTable('stuff');

    // Make textarea div editable and focus
    $('#textarea').attr('contenteditable','true');
    $('#textarea').focus();

    // Fill content
    $('#noteheader span').text(currentTable._tid);
    updateNoteInfo(currentTable);

    // Create note from textarea content
    $('#save-note').on('click', function(e){
      e.preventDefault();
      currentTable.insert({
        body: $('#textarea').text(),
        created: new Date()
      });
    });

    // Add event listener for changed records (local and remote)
    datastore.recordsChanged.addListener(function (event) {
      var changedRecords = event.affectedRecordsForTable(currentTable._tid);
      $('#textarea').empty();
      updateNoteInfo(currentTable);
    });
  });

});
