chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('popup.html', {
    id: "mainWinId",
    bounds: {
      width: 244,
      height: 380
    },
    maxWidth: 244,
    minWidth: 244,
    minHeight: 380,
    maxHeight: 380,
  });
});
