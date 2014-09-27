$(document).ready(function(){
  var backgroundPage, appController;

  backgroundPage = chrome.extension.getBackgroundPage();
  appController = backgroundPage.appController;

  backgroundPage.client.authenticate({interactive:false}, function (error) {
    if (error) {
      alert('Authentication error: ' + error);
      client.reset();
    }
  });

  $('#dropbox-signin').click(function(e) {
    e.preventDefault();
    appController.authenticate();
  });

  $('#dropbox-signout').click(function(e) {
    e.preventDefault();
    appController.signOut();
  });
});



// TODO REFACTOR BELOW
// ===============================================================

// Create DropBox Client for App
// var client = new Dropbox.Client({key: 'e4fbthwtr2v9ksp'});

// var prependNotes = function(notesArray) {
//   for(i = 0; i < notesArray.length; i++) {
//     $('#noteslist').prepend('<li>' + notesArray[i].get('body') + '</li>');
//   }
// };

// var lastNote = function(array) {
//   return array[array.length - 1]
// };

// var fillTextarea = function(table) {
//   var allNotes = table.query();
//   if (allNotes.length > 0) {
//     $('#textarea').text(lastNote(allNotes).get('body'));
//   }
// };

// var showLastNote = function(table) {
//   var allNotes = table.query();
//   if (allNotes.length > 0) {
//     $('#lastnoteinfo span').text(lastNote(allNotes).get('body'));
//     $('#lastnotecount span').text(allNotes.length);
//   }
// };

// $(document).ready(function() {

//   // User authenticates his Dropbox
//   client.authDriver(new Dropbox.AuthDriver.ChromeExtension({
//     receiverPath: "html/chrome_oauth_receiver.html"
//     })
//   );

//   client.authenticate(function(error, client){
//     if (error) {
//       console.log("NOOOOOOOOOO: " + error);
//     }
//     activateStorage(client);
//   });

//   // Clears user auth token
//   $('#dplogout').on('click', function(){
//     client.signOut();
//     $('#notearea').hide();
//     $('#dplogout').hide();
//     $('#dpauth').show();
//   });

//   function activateStorage(client) {

//     // Check if user is authenticated
//     if (client.isAuthenticated()) {
//       $('#notearea').show();
//       $('#dpauth').hide();
//       console.log('Auth success, User: ' + client.dropboxUid());
//     };

//     // Create default datastore for user
//     var datastoreManager = client.getDatastoreManager();
//     datastoreManager.openDefaultDatastore(function (error, datastore) {

//       if (error) {
//         console.log('Error opening default datastore: ' + error);
//       };

//       // Create tabled called notes in default datastore
//       var notesTable = datastore.getTable('stuff');
//       console.log(notesTable._tid + ' table', notesTable);
//       $('#noteheader span').text(notesTable._tid);

//       // Retrieve array of all notes
//       var results = notesTable.query();
//       console.log('all notes', results);
//       console.log('last note', lastNote(results));

//       // Fill textarea with last note
//       // $('#createnote textarea').val(lastNote(results).get('body'));
//       $('#textarea').attr('contenteditable','true');
//       $('#textarea').focus();
//       fillTextarea(notesTable);

//       // Append notes to list
//       // prependNotes(results);
//       showLastNote(notesTable);

//       // Create note from form input
//       $('#submitnote').on('click', function(e){
//         e.preventDefault();
//         var noteBody = $('#textarea').text();
//         var note = notesTable.insert({
//           body: noteBody,
//           created: new Date()
//         });
//         console.log('created note', note);
//         // $('#createnote').trigger('reset');
//       });

//       // Add event listener for changed records (local and remote)
//       datastore.recordsChanged.addListener(function (event) {
//         var changedRecords = event.affectedRecordsForTable(notesTable._tid);
//         console.log('records changed: ', changedRecords);
//         // prependNotes(changedRecords);
//         $('#textarea').empty();
//         showLastNote(notesTable);
//         fillTextarea(notesTable);
//       });

//     });
//   };
// });
