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
  toggleSidePanelScript: function(){

    var closeSidePanel = function(){
      var sidebar = document.querySelector('#sidenote_sidebar');
      document.body.removeChild(sidebar);
    };

    var openSidePanel = function(){
      var iframeStyle = "background: white; z-index: 999999999999999; position: fixed; width: 300px; height: 100%; border:none; top: 0px; right: 0px; bottom: 0px";
      var iframeSource = "chrome-extension://afbonmgmjbiofanjpldocnjbdkpeodbj/sidepanel.html";

      var iframeElement = '<iframe id="sidenote_sidebar" '+ iframeStyle +'src="'+ iframeSource +'" allowtransparency="false" scrolling="yes"></iframe>';

      document.body.appendChild(iframeElement);
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
