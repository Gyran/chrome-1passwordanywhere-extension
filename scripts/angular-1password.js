(function() {
    "use strict";

    angular.module("ng1password", []);
    angular.module("ng1password").service("$1password", function ($q, $window) {
        var onepassword;

        this.init = function (url) {
            var deferred = $q.defer();

            onepassword = new $window.OnePassword(url);
            onepassword.load().then(function () {
                deferred.resolve();
            }, function () {
                deferred.reject();
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

    });

})();
