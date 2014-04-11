(function (window) {
    var onepassword = null;
    var tab = null;

    var unlockWrapper = document.getElementById("unlockWrapper");
    var unlockedWrapper = document.getElementById("unlockedWrapper");

    var btnUnlock = document.getElementById("unlock");
    btnUnlock.disabled = true;
    var frmVerify = document.getElementById("frmVerify");
    var error = document.getElementById("error");
    var masterpassword = document.getElementById("masterpassword");


    function init () {
        Q.all([initOnePassword(), getActiveTab()]).spread(function (op, t) {
            onepassword = op;
            tab = t;
        });
    }

    function initOnePassword () {
        var deferred = Q.defer();

        chrome.storage.sync.get({
            "baseurl": "https://dl-web.dropbox.com/get/1password/1Password.agilekeychain/data/default/"
        }, function (items) {
            onepassword = new window.OnePassword(items.baseurl);
            onepassword.load().then(function () {
                btnUnlock.disabled = false;
            }, function () {
                error.textContent = "Could not load onepassword data. Make sure you are logged in to dropbox and that the url is correct on the options page.";
            });

            deferred.resolve(onepassword);
        });

        return deferred.promise;
    }

    function getCurrentDomain () {
        var url = new URL(tab.url);
        return tld.getDomain(url.hostname);
    }

    function verify (event) {
        error.textContent = "";
        event.preventDefault();

        var password = masterpassword.value;
        if (onepassword.verifyPassword(password)) {
            var domain = getCurrentDomain();
            var webforms = onepassword.webformsFromDomain(domain);

            unlockWrapper.classList.add("hide");
            unlockedWrapper.classList.remove("hide");

            if (webforms.length === 1) {
                fillForm(webforms[0]);
            } else if (webforms.length > 1) {
                // TODO: show a list of possible webforms
                fillForm(webforms[0]);
            } else {
                error.textContent = "No password for this domain found!";
            }
        } else {
            error.textContent = "Wrong master password!";
        }
    }

    function injectFillFormScript () {
        var deferred = Q.defer();

        chrome.tabs.executeScript({
            file: "scripts/fillForm.js",
        }, function (results) {
            deferred.resolve();
        });

        return deferred.promise;
    }

    function fillForm (webform) {
        Q.all([injectFillFormScript(), onepassword.getKeychainItem(webform.uuid)]).spread(function (result, item) {
            onepassword.decryptKeychainItem(item);

            chrome.tabs.sendMessage(tab.id, item.decrypted_secure_contents);
        });
    }

    function getActiveTab() {
        var deferred = Q.defer();

        chrome.tabs.query({
            currentWindow: true, active: true
        }, function (tabs) {
            deferred.resolve(tabs[0]);
        });

        return deferred.promise;
    }

    document.addEventListener("DOMContentLoaded", init);
    frmVerify.addEventListener("submit", verify);

})(this);
