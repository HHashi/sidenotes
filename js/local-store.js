var localStore = {}

localStore.sha1 = new Hashes.SHA1

localStore.keyForNoteUrl = function(url) {
  return this.namespace + ':' + this.sha1.hex(url)
}

localStore.init = function(namespace, chromeStore, onChange) {
  this.namespace = namespace
  this.chromeKVStore = chromeStore.local
  onChange = onChange || function(){}
  // listen for changes in underlying store and call onChange *once*
  // for each individual record change
  chromeStore.onChanged.addListener(function(changes, chromeNamespace) {
    Object.keys(changes).forEach(function(key){
      var change = changes[key]
      onChange(change.newValue.url, change.newValue, change.oldValue)
    })
  })
}

localStore.put = function(url, note, cb) {
  note.url = url // ensure url of note is consistent with key

  // compose key from namespace + hash of url
  var key = this.keyForNoteUrl(note.url)
  // compose key value pair to make stupid chrome local store api happy
  var kv = {}; kv[key] = note
  // default cb to noop
  cb = cb || function(){}
  // now write the record
  this.chromeKVStore.set(kv, function(){ cb(note) })
}

localStore.get = function(url, cb) {
  if (!cb) throw new Error("need a callback to give you the note!")
  this.chromeKVStore.get(this.keyForNoteUrl(url), function(contents){
    // contents is a single key/value pair, get just the first key
    var noteKey = Object.keys(contents)[0]
    // then return the value
    cb(contents[noteKey])
  })
}

localStore.all = function(cb) {
  if (!cb) throw new Error("need a callback to give you the notes!")
  // make and capture a function that will only return true when passed
  // the key for a note
  var keyFilter = this.keyFilter() // note the invocation
  // get *everything* in the store
  this.chromeKVStore.get(null, function(contents){
    // filter the keys to just the ones for notes
    var noteKeys = Object.keys(contents).filter(keyFilter)
    // and then return those notes to the callback
    var notes = noteKeys.map(function(key){ return contents[key] })
    cb(notes)
  })
}

localStore.keyFilter = function() {
  var namespace = this.namespace
  // return a function that takes a string and returns true when that
  // string begins with the namespace plus a colon character
  return function(key) { return key.match(new RegExp('^'+namespace+':')) }
}
