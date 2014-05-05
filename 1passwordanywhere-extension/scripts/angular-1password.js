(function() {
    "use strict";

    angular.module("ng1password", []);
    angular.module("ng1password").service("$1password", function ($q) {
        var onepassword;

        this.init = function (dp) {
            var deferred = $q.defer();

            dp.init().then(function () {
                onepassword = new OnePassword(dp);
                onepassword.load().then(function () {
                    deferred.resolve();
                }, function () {
                    deferred.reject();
                });
            });

            return deferred.promise;
        };

        this.unlock = function (password) {
            return onepassword.verifyPassword(password);
        };

        this.webformsWithDomain = function (domain) {
            return onepassword.webformsWithDomain(domain);
        };

        this.getKeychainItem = function (itemId) {
            var deferred = $q.defer();

            onepassword.getKeychainItem(itemId).then(function (item) {
                deferred.resolve(item);
            });

            return deferred.promise;
        };

        this.decrypt = function (item) {
            onepassword.decrypt(item);
            return item;
        };

        function OnePassword (dp) {
            this.dataProvider = dp;
            this.keychain = new Keychain();
        }

        OnePassword.prototype.load = function () {
            var deferred = $q.defer();

            $q.all([this.getContents(), this.getEncryptionKeys()]).then(function () {
                deferred.resolve();
            }, function () {
                deferred.reject();
            });

            return deferred.promise;
        };
        OnePassword.prototype.getContents = function () {
            var that = this;
            var deferred = $q.defer();

            this.dataProvider.getContents().then(function (contents) {
                that.keychain.setContents(contents);
                deferred.resolve();
            }, function () {
                deferred.reject();
            });

            return deferred.promise;
        };
        OnePassword.prototype.getEncryptionKeys = function () {
            var that = this;
            var deferred = $q.defer();

            that.dataProvider.getEncryptionKeys().then(function (keys) {
                that.keychain.setEncryptionKeys(keys);
                deferred.resolve();
            }, function () {
                deferred.reject();
            });

            return deferred.promise;
        };

        OnePassword.prototype.verifyPassword = function (password) {
            return this.keychain.verifyPassword(password);
        };

        OnePassword.prototype.getKeychainItem = function (entryid) {
            var that = this;
            var deferred = $q.defer();

            that.dataProvider.getKeychainItem(entryid).then(function (entry) {
                deferred.resolve(new KeychainItem(entry, that.keychain));
            });

            return deferred.promise;
        };

        OnePassword.prototype.webformsWithDomain = function (domain) {
            var ret = [];

            ret = this.keychain.contents[TYPE_WEBFORMS].filter(function (webform) {
                try {
                    var url = new URL(webform.domain);
                    var webformDomain = tld.getDomain(url.hostname);

                    if (domain === webformDomain) {
                        return true;
                    }
                } catch (err) {
                    console.log("ERROR! when trying to populate webforms", err, webform);
                }
                return false;
            });

            return ret;
        };

        OnePassword.prototype.decrypt = function (keychainItem) {
            keychainItem.decrypt(this.keychain);
        };


    });

})();
