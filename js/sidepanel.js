//TODO Move Into Background to get Current URL of Active Tab
function getCurrentUrl() {
  var currentUrl;
  chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
      currentUrl = tabs[0].url;
      console.log(currentUrl);
  });

}


