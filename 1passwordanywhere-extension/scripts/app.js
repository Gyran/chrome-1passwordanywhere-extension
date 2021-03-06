(function() {
    "use strict";
    angular.module("1passwordanywhere-extension",
        [
            "ngRoute",
            "ng1password",
            "ngChrome",
            "ngDropbox",
            "ng1password.Dropbox",
        ]
    )
    .config(["$routeProvider", function ($routeProvider) {
        $routeProvider
            .when("/locked", {
                controller: "LockedCtrl",
                templateUrl: "partials/locked.html"
            })
            .when("/unlocked", {
                controller: "UnlockedCtrl",
                templateUrl: "partials/unlocked.html"
            })
            .otherwise({ redirectTo: "/locked" })
            ;
    }])
    .config(["$DropboxProvider", function ($DropboxProvider) {
        $DropboxProvider.config("65mje5j1j340pcq");
    }])
    .controller("LockedCtrl", ["$scope", "$location", "$1password",
        function ($scope, $location, $1password) {
        $scope.error = false;
        $scope.unlocking = false;

        $scope.unlock = function () {
            $scope.unlocking = true;
            $scope.error = false;

            $scope.initPromise.then(function () {
                if ($1password.unlock($scope.masterpassword)) {
                    $location.path("/unlocked");
                } else {
                    $scope.error = true;
                }
                $scope.unlocking = false;
            });
        };
    }])
    .controller("UnlockedCtrl", ["$scope", "$1password", "$chromeTabs", "$window",
        function ($scope, $1password, $chromeTabs, $window) {
        $scope.filling = false;
        $scope.unlocking = true;

        $scope.initPromise.then(function () {
            $scope.webforms = $scope.webformsCurrentDomain;
            $scope.unlocking = false;

            if ($scope.webforms.length === 1) {
                $scope.fillForm($scope.webforms[0]);
            }
        });

        $scope.fillForm = function (webform) {
            $scope.filling = true;

            $chromeTabs.executeScript({
                file: "scripts/fillForm.js"
            }).then(function () {
                $1password.getKeychainItem(webform.uuid).then(function (item) {
                    $1password.decrypt(item);
                    $chromeTabs.sendMessage($scope.currentTabId, item.decrypted_secure_contents)
                        .then(function () {
                            $scope.filling = false;
                            $window.close();
                    });
                });
            });
        };
    }])

    .run(function ($q, $1password, $location, $rootScope, $Dropbox, $1pDropboxDataprovider, $chromeTabs) {
        var deferred = $q.defer();
        $rootScope.initPromise = deferred.promise;

        $Dropbox.authenticate({ interactive: false }).then(function () {
            $1password.init($1pDropboxDataprovider).then(function () {
                $chromeTabs.getSelected().then(function (tab) {
                    var domain = tld.getDomain((new URL(tab.url)).hostname);
                    $rootScope.webformsCurrentDomain = $1password.webformsWithDomain(domain);
                    $rootScope.currentTabId = tab.id;

                    deferred.resolve();
                });
            });
        }, function () {
            $chromeTabs.create({ url: "options.html"});
        });

        $location.path("/locked");
    })
    ;

})();
