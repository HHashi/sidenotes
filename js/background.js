var DROPBOX_APP_KEY = 'e4fbthwtr2v9ksp';

// Create DropBox Client for App
var client = new Dropbox.Client({key: DROPBOX_APP_KEY});
var panelDisplayed;

client.onAuthStepChange.addListener(function(event){
  if(client.isAuthenticated()){
    //activateNotes(); // This is not being used
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
  shrinkWindowWidth: function(){
    document.body.style.width = (document.body.clientWidth - 300) + "px";
  },
  windowRestore: function(){
    document.body.style.width = (document.body.clientWidth + 300) + "px";
  },
  toggleClose: function(){
    var sidebar = document.querySelector('#sidenote_sidebar');
    document.body.removeChild(sidebar);
  },
  addSidebar: function(){
    var newElement = document.createElement('iframe');
    newElement.setAttribute("id", "sidenote_sidebar");
    newElement.setAttribute("style", "background: white; z-index: 999999999999999; position: fixed; width: 300px; height: 100%; border:none; top: 0px; right: 0px; bottom: 0px");
    newElement.setAttribute("src", "chrome-extension://afbonmgmjbiofanjpldocnjbdkpeodbj/sidepanel.html");
    newElement.setAttribute("allowtransparency", "false");
    newElement.setAttribute("scrolling", "yes");
    document.body.appendChild(newElement);
  },
  toggleSidePanel: function(){
     if (panelDisplayed === false) {
      chrome.tabs.executeScript({ code: this.formatScript(this.shrinkWindowWidth) });
      chrome.tabs.executeScript({ code: this.formatScript(this.addSidebar, "\n") });
      panelDisplayed = true;
    }
    else {
      chrome.tabs.executeScript({ code: this.formatScript(this.windowRestore) });
      chrome.tabs.executeScript({ code: this.formatScript(this.toggleClose, "\n") });
      panelDisplayed = false;
    }
  },
  formatScript: function(script, format){
    return script.toString().split("\n").slice(1, -1).join(format);
  }

};
