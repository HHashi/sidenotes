// Tracer for debugging

function trace(name, val){
  var args = (val === undefined) ? [name] : [name, val]
  console.log.apply(console, args)
}

// --

// Config

var DROPBOX_APP_KEY = 'e4fbthwtr2v9ksp'
var NOTE_NAMESPACE  = 'sidenotes-store-test'

// Driver code

test()

function test() {
  setup(function(chromeStore, dbStore){
    // Setup local and remote stores for testing
    // remoteStore.init(NOTE_NAMESPACE, dbStore, function(url, noteValue, previousValue){
    //   console.log('remote note change')
    //   console.log(url, noteValue, previousValue)
    // })

    localStore .init(NOTE_NAMESPACE, chromeStore, function(url, noteValue, previousValue){
      console.log('local note change')
      console.log(url, noteValue, previousValue)
    })

    // When this record saves you should see it in the datastore:
    // https://www.dropbox.com/developers/browse_datastores/645312
    localStore.put('http://devbootcamp.com', {
      'body': 'a bootcamp',
      'date': JSON.stringify(new Date)
    }, function(note){
      localStore.all(function(notes){
        console.log("all notes")
        console.log(notes)
      })
      localStore.get('http://devbootcamp.com', function(note){
        console.log("devbootcamp note")
        console.log(note)
      })
    })
  })
}

// Setup both local and remote data stores in a deterministic state,
// i.e. connect to both and them wipe any mutations we made during
// the previous run of this test

function setup(cb) {
  // Setup Drobox client
  var dropboxClient = new Dropbox.Client({key: DROPBOX_APP_KEY})
  // Authenticate with Dropbox
  dropboxClient.onAuthStepChange.addListener(function(event) {
    if (dropboxClient.isAuthenticated()) {
      // Connect to Dropbox datastore
      dropboxClient.getDatastoreManager().openDefaultDatastore(function(error, dropboxDatastore) {
        if (error) return console.error(error)
        // Grab the local dropbox config so we clear local store for testing
        chrome.storage.local.get(null, function(store) {
          var testNoteKeys = Object.keys(store).filter(notesKeyFilter)
          // Remove the test notes from local store
          chrome.storage.local.remove(testNoteKeys, function(){
            // Remove the test notes from dropbox
            dropboxDatastore.getTable(NOTE_NAMESPACE).query().forEach(function(record){
              record.deleteRecord()
            })
            // Finally, call the callback passed into this fn
            cb(chrome.storage, dropboxDatastore)
          })
        })
      })
    }
    else console.error("couldn't auth with dropbox")
  });

  dropboxClient.authenticate({interactive:false})
}

function notesKeyFilter(str) { return str.match(new RegExp('^'+NOTE_NAMESPACE+':')) }

