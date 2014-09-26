var client = new Dropbox.Client({ key: '0fz3bzmtgy70o7q' });

client.authDriver(new Dropbox.AuthDriver.ChromeExtension({
  receiverPath: "html/chrome_oauth_receiver.html"
  })
);

client.authenticate(function(error, client) {
    if (error) {
      return console.log(error);
    }
    console.log(client.credentials());
});