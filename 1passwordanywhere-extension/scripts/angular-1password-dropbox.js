(function() {
    "use strict";

    angular.module("ng1password.Dropbox", ["ngDropbox"]);

    angular.module("ng1password.Dropbox").service("$1pDropboxDataprovider", function ($q, $Dropbox) {
        var ONEPASSWORD_DEFAULT_ROOTPATH = "1Password/1Password.agilekeychain";
        var ONEPASSWORD_DEFAULT_FILESPATH = "/data/default/";
        var path;

        this.init = function () {
            var deferred = $q.defer();

            $Dropbox.readFile(".ws.agile.1Password.settings").then(function (file) {
                path = file + ONEPASSWORD_DEFAULT_FILESPATH;

                deferred.resolve(true);
            }, function (error) {
                console.log("Failed to load '.ws.agile.1Password.settings', using default path", error);
                path = ONEPASSWORD_DEFAULT_ROOTPATH + ONEPASSWORD_DEFAULT_FILESPATH;

                deferred.resolve(false);
            });

            return deferred.promise;
        };

        this.getContents = function () {
            var deferred = $q.defer();

            $Dropbox.readFile(path + "contents.js").then(function (file) {
                deferred.resolve(JSON.parse(file));
            });

            return deferred.promise;
        };

        this.getEncryptionKeys = function () {
            var deferred = $q.defer();

            $Dropbox.readFile(path + "encryptionKeys.js").then(function (file) {
                deferred.resolve(JSON.parse(file));
            });

            return deferred.promise;
        };

        this.getKeychainItem = function (entryid) {
            var deferred = $q.defer();

            $Dropbox.readFile(path + entryid + ".1password").then(function (file) {
                deferred.resolve(JSON.parse(file));
            });

            return deferred.promise;
        };
    });

})();
