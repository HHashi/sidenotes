$(document).ready(function() {

  var shrinkWindowWidth = function(){
      document.body.style.width = (document.body.clientWidth - 300) + "px";
    };

  var windowRestore = function(){
      document.body.style.width = (document.body.clientWidth + 300) + "px";
    };

  var toggleClose = function(){
    var sidebar = document.querySelector('#sidenote_sidebar');
    document.body.removeChild(sidebar);
  };

  var addSidebar = function(){
    var newElement = document.createElement('iframe');
    newElement.setAttribute("id", "sidenote_sidebar");
    newElement.setAttribute("style", "background: white; z-index: 999999999999999; position: fixed; width: 300px; height: 100%; border:none; top: 0px; right: 0px; bottom: 0px");
    newElement.setAttribute("src", "chrome-extension://afbonmgmjbiofanjpldocnjbdkpeodbj/sidepanel.html");
    newElement.setAttribute("allowtransparency", "false");
    newElement.setAttribute("scrolling", "yes");
    document.body.appendChild(newElement);
  };

  var toggleSidePanel = function(){
    var sidebarPresent = $('#sidenote_sidebar');
    if(sidebarPresent) {
      panelDisplayed = true;
    }
    else {
      panelDisplayed = false;
    }

    if (panelDisplayed === false) {
      shrinkWindowWidth();
      addSidebar();
    }
    else {
      windowRestore();
      toggleClose();
    }
  }


});




// --------------------

var toggleSidePanel = function(){

  var shrinkWindowWidth = function(){
    document.body.style.width = (document.body.clientWidth - 300) + "px";
  };

  var windowRestore = function(){
      document.body.style.width = (document.body.clientWidth + 300) + "px";
  };

  var toggleClose = function(){
    var sidebar = document.querySelector('#sidenote_sidebar');
    document.body.removeChild(sidebar);
  };

  var addSidebar = function(){
    var newElement = document.createElement('iframe');
    newElement.setAttribute("id", "sidenote_sidebar");
    newElement.setAttribute("style", "background: white; z-index: 999999999999999; position: fixed; width: 300px; height: 100%; border:none; top: 0px; right: 0px; bottom: 0px");
    newElement.setAttribute("src", "chrome-extension://afbonmgmjbiofanjpldocnjbdkpeodbj/sidepanel.html");
    newElement.setAttribute("allowtransparency", "false");
    newElement.setAttribute("scrolling", "yes");
    document.body.appendChild(newElement);
  };

  var sidebarPresent = $('#sidenote_sidebar');
  if(sidebarPresent) {
    panelDisplayed = true;
  }
  else {
    panelDisplayed = false;
  }

  if (panelDisplayed === false) {
    shrinkWindowWidth();
    addSidebar();
  }
  else {
    windowRestore();
    toggleClose();
  }
}



