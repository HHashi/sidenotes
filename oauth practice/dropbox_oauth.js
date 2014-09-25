window.onload = function(){
  var client = new Dropbox.Client({ key: client_key });

  client.authDriver(new Dropbox.AuthDriver.ChromeExtension({
    receiverPath: "chrome_oauth_receiver.html"
  }));

  client.authenticate(function(error, client) {
      if (error) {
        return console.log(error);
      }
      console.log('success');

  });
}