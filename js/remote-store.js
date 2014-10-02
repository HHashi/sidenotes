var remoteStore = {}

remoteStore.sha1 = new Hashes.SHA1

remoteStore.keyForNoteUrl = function(url) {
  return this.namespace + ':' + this.sha1.hex(url)
}

// the underlying storage mechanism being shimmed
remoteStore.init = function(namespace, dropboxStore, onChange) {
  this.dropboxKVStore = dropboxStore.getTable(namespace)
  // todo: listen for changes in underlying store and call onChange
}

remoteStore.put = function(url, note, cb) {
  // todo
}

remoteStore.get = function(url, note, cb) {
  // todo
}

remoteStore.all = function(cb) {
  // todo
}
