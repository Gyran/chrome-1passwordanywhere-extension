var client = new Dropbox.Client({
    key: "65mje5j1j340pcq"
});
client.authDriver(new Dropbox.AuthDriver.ChromeExtension({
    receiverPath: "lib/dropbox-js/chrome_oauth_receiver.html"
}));

client.authenticate(function (error) {
    if (error) {

    } else {
        if (client.isAuthenticated()) {
            document.write("You are now logged in to Dropbox");
        }
    }
});
