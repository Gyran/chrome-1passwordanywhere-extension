(function (window) {
    var keychain = null;

    function OnePassword (url) {
        this.baseUrl = url;
        keychain = new Keychain();
    }

    OnePassword.prototype.load = function () {
        var deferred = Q.defer();

        Q.all([this.getContents(), this.getEncryptionKeys()]).then(function () {
            deferred.resolve();
        });

        return deferred.promise;
    };
    OnePassword.prototype.getContents = function () {
        var deferred = Q.defer();

        getJson(this.baseUrl + "contents.js").then(function (contents) {
            keychain.setContents(contents);
            deferred.resolve();
        }, function () {
            deferred.reject();
        });

        return deferred.promise;
    };
    OnePassword.prototype.getEncryptionKeys = function () {
        var deferred = Q.defer();

        getJson(this.baseUrl + "encryptionKeys.js").then(function (keys) {
            keychain.setEncryptionKeys(keys);
            deferred.resolve();
        }, function () {
            deferred.reject();
        });

        return deferred.promise;
    };

    OnePassword.prototype.verifyPassword = function (password) {
        return keychain.verifyPassword(password);
    };

    OnePassword.prototype.getKeychainItem = function (entryid) {
        var deferred = Q.defer();

        getJson(this.baseUrl + entryid + ".1password").then(function (entry) {
            deferred.resolve(new KeychainItem(entry, keychain));
        });

        return deferred.promise;
    };

    OnePassword.prototype.webformsFromDomain = function (domain) {
        var ret = [];
        for (var index in keychain.contents[TYPE_WEBFORMS]) {
            var webform = keychain.contents[TYPE_WEBFORMS][index];
            var url = new URL(webform.domain);
            var webformDomain = tld.getDomain(url.hostname);

            if (domain === webformDomain) {
                ret.push(webform);
            }
        }

        return ret;
    };

    OnePassword.prototype.decryptKeychainItem = function (keychainItem) {
        keychainItem.decrypt(keychain);
    };

    var getJson = function (url, cb) {
        var deferred = Q.defer();

        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.onload = function (e) {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    deferred.resolve(JSON.parse(xhr.responseText));
                } else {
                    deferred.reject(new Error(xhr.statusText));
                }
            }
        };

        xhr.onerror = function () {
            cb(xhr.statusText);
        };

        xhr.send();

        return deferred.promise;
    };

    window.OnePassword = OnePassword;
})(this);
