var DROPBOX_APP_KEY = 'e4fbthwtr2v9ksp';

// Create DropBox Client for App
var client = new Dropbox.Client({key: DROPBOX_APP_KEY});
var panelDisplayed;

client.onAuthStepChange.addListener(function(event){
  if(client.isAuthenticated()){
    // localStorage.setItem('client', JSON.stringify(client.credentials()));
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
  toggleSidePanelScript: function(){

    var closeSidePanel = function(){
      var sidebar = document.querySelector('#sidenote_sidebar');
      document.body.removeChild(sidebar);
    };

    var openSidePanel = function(){
      var newElement = document.createElement('iframe');
      newElement.setAttribute("id", "sidenote_sidebar");
      newElement.setAttribute("style", "background: #fff; z-index: 999999999999999; position: fixed; top: 0px; right: 0px; bottom: 0px; width: 300px; height: 100%; border-left:1px solid #eee; box-shadow:0 -1px 7px 0px #aaa; overflow-x: hidden;");
      newElement.setAttribute("src", "chrome-extension://afbonmgmjbiofanjpldocnjbdkpeodbj/html/sidepanel.html");
      newElement.setAttribute("allowtransparency", "false");
      newElement.setAttribute("scrolling", "yes");
      document.body.appendChild(newElement);
    };

    if (document.querySelector('#sidenote_sidebar')) {
      document.body.style.width = (document.body.clientWidth + 300) + "px";
      closeSidePanel();
    }
    else {
      document.body.style.width = (document.body.clientWidth - 300) + "px";
      openSidePanel();
    }
  },
  formatScript: function(script, format){
    return script.toString().split("\n").slice(1, -1).join(format);
  },
  toggleSidePanel: function() {
    chrome.tabs.executeScript({code: this.formatScript(this.toggleSidePanelScript, "\n")});
  }
};
