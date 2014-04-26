(function() {
    "use strict";

    angular.module("ng1password.Dropbox", ["ngDropbox"]);

    angular.module("ng1password.Dropbox").service("$1pDropboxDataprovider", function ($q, $Dropbox) {
        var rootPath = "1password/1Password.agilekeychain/data/default/";

        this.getContents = function () {
            var deferred = $q.defer();

            $Dropbox.readFile(rootPath + "contents.js").then(function (file) {
                deferred.resolve(JSON.parse(file));
            });

            return deferred.promise;
        };

        this.getEncryptionKeys = function () {
            var deferred = $q.defer();

            $Dropbox.readFile(rootPath + "encryptionKeys.js").then(function (file) {
                deferred.resolve(JSON.parse(file));
            });

            return deferred.promise;
        };

        this.getKeychainItem = function (entryid) {
            var deferred = $q.defer();

            $Dropbox.readFile(rootPath + entryid + ".1password").then(function (file) {
                deferred.resolve(JSON.parse(file));
            });

            return deferred.promise;
        };
    });

})();
