(function() {
    "use strict";

    angular.module("ngChrome", []);
    angular.module("ngChrome").service("$chromeTabs", function ($q) {
        this.query = function (queryInfo) {
            var deferred = $q.defer();

            chrome.tabs.query(queryInfo, function (tabs) {
                deferred.resolve(tabs);
            });

            return deferred.promise;
        };

        this.getSelected = function () {
            var deferred = $q.defer();

            this.query({
                currentWindow: true,
                active: true
            }).then(function (tabs) {
                deferred.resolve(tabs[0]);
            });

            return deferred.promise;
        };

        this.executeScript = function (details) {
            var deferred = $q.defer();

            chrome.tabs.executeScript(details, function (result) {
                deferred.resolve(result);
            });

            return deferred.promise;
        };

        this.sendMessage = function (tabId, message) {
            var deferred = $q.defer();

            chrome.tabs.sendMessage(tabId, message, function (response) {
                deferred.resolve(response);
            });

            return deferred.promise;
        };

        this.create = function (createProperties) {
            var deferred = $q.defer();

            chrome.tabs.create(createProperties, function (tab) {
                deferred.resolve(tab);
            });

            return deferred.promise;
        };
    });

    angular.module("ngChrome").factory("$chromeSyncStorage", function ($q) {
        return new ChromeStorage($q, chrome.storage.sync);
    });
    angular.module("ngChrome").factory("$chromeLocalStorage", function ($q) {
        return new ChromeStorage($q, chrome.storage.local);
    });

    function ChromeStorage($q, storageArea) {
        this._storageArea = storageArea;
        this._$q = $q;
    }

    ChromeStorage.prototype = {
        get: function (keys) {
            var deferred = this._$q.defer();

            this._storageArea.get(keys, function (items) {
                deferred.resolve(items);
            });

            return deferred.promise;
        },

        getBytesInUse: function (keys) {
            var deferred = this._$q.defer();

            this._storageArea.getBytesInUse(keys, function (bytesInUse) {
                deferred.resolve(bytesInUse);
            });

            return deferred.promise;
        },

        set: function (items) {
            var deferred = this._$q.defer();

            this._storageArea.set(items, function () {
                deferred.resolve();
            });

            return deferred.promise;
        },

        remove: function (keys) {
            var deferred = this._$q.defer();

            this._storageArea.remove(keys, function () {
                deferred.resolve();
            });

            return deferred.promise;
        },

        clear: function () {
            var deferred = this._$q.defer();

            this._storageArea.clear(function () {
                deferred.resolve();
            });

            return deferred.promise;
        }
    };

    angular.module("ngChrome").service("$chromeRuntime", function ($q) {
        this.sendMessage = function (message) {
            var deferred = $q.defer();

            chrome.runtime.sendMessage(message, function (response) {
                deferred.resolve(response);
            });

            return deferred.promise;
        };
    });

})();
