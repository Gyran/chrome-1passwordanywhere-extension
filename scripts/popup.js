(function (window) {
    var onepassword = null;
    var tab = null;

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
                btnVerify.disabled = false;
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
        event.preventDefault();

        var password = document.getElementById("masterpassword").value;
        if (onepassword.verifyPassword(password)) {
            var domain = getCurrentDomain();
            var webforms = onepassword.webformsFromDomain(domain);
            fillForm(webforms[0]);
            //window.close();
        } else {
            alert("wrong password!");
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


    btnVerify = document.getElementById("btnVerify");
    btnVerify.disabled = true;
    frmVerify = document.getElementById("frmVerify");

    document.addEventListener("DOMContentLoaded", init);
    frmVerify.addEventListener("submit", verify);

})(this);
