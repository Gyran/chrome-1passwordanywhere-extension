(function () {
    "use strict"
    angular.module("1passwordanywhere-extension-options",
        [
            "ngDropbox",
            "ngRoute"
        ]
    );
    angular.module("1passwordanywhere-extension-options")
    .config(["$DropboxProvider", function ($DropboxProvider) {
        $DropboxProvider.config("65mje5j1j340pcq",
            new Dropbox.AuthDriver.ChromeExtension({
                receiverPath: "lib/dropbox-js/chrome_oauth_receiver.html"
            }));
    }]);

    angular.module("1passwordanywhere-extension-options")
    .config(["$routeProvider", function ($routeProvider) {
        $routeProvider
            .when("/loading", {
                controller: "LoadingCtrl",
                templateUrl: "partials/options/loading.html"
            })
            .when("/isNotAuthenticated", {
                controller: "IsNotAuthenticatedCtrl",
                templateUrl: "partials/options/isNotAuthenticated.html"
            })
            .when("/isAuthenticated", {
                controller: "IsAuthenticatedCtrl",
                templateUrl: "partials/options/isAuthenticated.html"
            })
            .otherwise({ redirectTo: "/loading" })
            ;
    }]);

    angular.module("1passwordanywhere-extension-options")
    .controller("LoadingCtrl", ["$scope", "$Dropbox", "$location",
        function ($rootScope, $Dropbox, $location) {
            $Dropbox.authenticate({ interactive: false }).then(function () {
                $location.path("/isAuthenticated");
            }, function () {
                $location.path("/isNotAuthenticated");
            });
        }]
    );
    angular.module("1passwordanywhere-extension-options")
    .controller("IsNotAuthenticatedCtrl", ["$scope", "$Dropbox", "$location",
        function ($scope, $Dropbox, $location) {
            $scope.error = "";

            $scope.authenticate = function () {
                $scope.error = "";

                $Dropbox.authenticate().then(function () {
                    $location.path("/isAuthenticated");
                }, function () {
                    $scope.error = "Could not authenticate with Dropbox";
                    $Dropbox.reset();
                });
            };
        }]
    );
    angular.module("1passwordanywhere-extension-options")
    .controller("IsAuthenticatedCtrl", ["$scope",
        function ($scope) {

        }]
    );

})();
