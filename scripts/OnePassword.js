(function (window) {
    var keychain = null;
    var dataProvider = null;

    function OnePassword (dp) {
        dataProvider = dp;
        keychain = new Keychain();
    }

    OnePassword.prototype.load = function () {
        var deferred = Q.defer();

        Q.all([this.getContents(), this.getEncryptionKeys()]).then(function () {
            deferred.resolve();
        }, function () {
            deferred.reject();
        });

        return deferred.promise;
    };
    OnePassword.prototype.getContents = function () {
        var deferred = Q.defer();

        dataProvider.getContents().then(function (contents) {
            keychain.setContents(contents);
            deferred.resolve();
        }, function () {
            deferred.reject();
        });

        return deferred.promise;
    };
    OnePassword.prototype.getEncryptionKeys = function () {
        var deferred = Q.defer();

        dataProvider.getEncryptionKeys().then(function (keys) {
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

        dataProvider.getKeychainItem(entryid).then(function (entry) {
            deferred.resolve(new KeychainItem(entry, keychain));
        });

        return deferred.promise;
    };

    OnePassword.prototype.webformsWithDomain = function (domain) {
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

    OnePassword.prototype.decrypt = function (keychainItem) {
        keychainItem.decrypt(keychain);
    };

    window.OnePassword = OnePassword;
})(this);
