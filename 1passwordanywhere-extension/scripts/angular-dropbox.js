(function() {
    "use strict";

    angular.module("ngDropbox", []);
    angular.module("ngDropbox").provider("$Dropbox", function $DropboxProvider () {
        var client;

        this.config = function (appKey, authDriver) {
            client = new Dropbox.Client({
                key: appKey
            });
            if (authDriver) {
                client.authDriver(authDriver);
            }
        };

        this.$get = ["$q", function ($q) {
            return {
                authenticate: function (options) {
                    var deferred = $q.defer();

                    if (!options) {
                        options = {};
                    }

                    client.authenticate(options, function (error) {
                        if (!client.isAuthenticated()) {
                            deferred.reject(error);
                        } else {
                            deferred.resolve();
                        }
                    });

                    return deferred.promise;
                },
                readFile: function (path) {
                    var deferred = $q.defer();

                    client.readFile(path, function (error, data) {
                        if (error) {
                            deferred.reject(error);
                        } else {
                            deferred.resolve(data);
                        }
                    });

                    return deferred.promise;
                },
                isAuthenticated: function () {
                    return client.isAuthenticated();
                },
                reset: function () {
                    return client.reset();
                }

            };
        }];
    });

})();
