(function() {
    "use strict";
    angular.module("1passwordanywhere-extension",
        [
            "ngRoute",
            "ng1password",
            "ngChrome"
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
    .controller("LockedCtrl", ["$scope", "$location", "$1password",
        function ($scope, $location, $1password) {
        $scope.error = false;

        $scope.unlock = function () {
            if ($1password.unlock($scope.masterpassword)) {
                $location.path("/unlocked");
            } else {
                $scope.error = true;
            }
        };
    }])
    .controller("UnlockedCtrl", ["$scope", "$1password", "$chromeTabs", "$window",
        function ($scope, $1password, $chromeTabs, $window) {
        var currentTab;
        $scope.filling = false;

        $scope.onepasswordPromise.then(function () {
            $chromeTabs.getSelected().then(function (tab) {
                var domain = tld.getDomain((new URL(tab.url)).hostname);
                currentTab = tab;
                $scope.webforms = $1password.webformsWithDomain(domain);

                if ($scope.webforms.length === 1) {
                    $scope.fillForm($scope.webforms[0]);
                }
            });
        });

        $scope.fillForm = function (webform) {
            $scope.filling = true;
            $chromeTabs.executeScript({
                file: "scripts/fillForm.js"
            }).then(function () {
                $1password.getKeychainItem(webform.uuid).then(function (item) {
                    $1password.decrypt(item);
                    $chromeTabs.sendMessage(currentTab.id, item.decrypted_secure_contents)
                        .then(function () {
                            $scope.filling = false;
                            $window.close();
                    });
                });
            });
        };
    }])

    .run(function ($1password, $location, $chromeSyncStorage, $rootScope) {
        var defaultBaseurl = "https://dl-web.dropbox.com/get/1password/1Password.agilekeychain/data/default/";

        $chromeSyncStorage.get({
            "baseurl": defaultBaseurl
        }).then(function (items) {
            $rootScope.onepasswordPromise = $1password.init(items.baseurl);
        });

        $location.path("/locked");
    })
    ;

})();
