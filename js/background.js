var DROPBOX_APP_KEY = 'lk7fwa8due76prs';
// Create DropBox Client for App
var client = new Dropbox.Client({key: DROPBOX_APP_KEY});

client.onAuthStepChange.addListener(function(event){
  if(client.isAuthenticated()){
    activateNotes();
  }
});

appController = {
  isAuthenticated: function(){
    return client.isAuthenticated();
  },
  authenticate: function(){
    client.authenticate();
  },
  signOut: function(){
    client.signOut(null, function(){
      client.reset();
    });
  },
};