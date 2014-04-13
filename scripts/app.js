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
.run(function ($1password, $location, $chromeSyncStorage) {
    var defaultBaseurl = "https://dl-web.dropbox.com/get/1password/1Password.agilekeychain/data/default/";

    $chromeSyncStorage.get({
        "baseurl": defaultBaseurl
    }).then(function (items) {
        $1password.init(items.baseurl);
    });

    $location.path("/locked");
})
;


function LockedCtrl ($scope, $location, $1password) {
    $scope.error = false;

    $scope.unlock = function () {
        if ($1password.unlock($scope.masterpassword)) {
            $location.path("/unlocked");
        } else {
            $scope.error = true;
        }
    };
}

function UnlockedCtrl ($scope, $1password, $chromeTabs) {
    var currentTab;

    //setTimeout(function () {
    $chromeTabs.getSelected().then(function (tab) {
        var domain = tld.getDomain((new URL(tab.url)).hostname);
        currentTab = tab;
        $scope.webforms = $1password.webformsWithDomain(domain);
    });
    //}, 500);

    $scope.fillForm = function (webform) {
        $chromeTabs.executeScript({
            file: "scripts/fillForm.js"
        }).then(function () {
            $1password.getKeychainItem(webform.uuid).then(function (item) {
                $1password.decrypt(item);
                $chromeTabs.sendMessage(currentTab.id, item.decrypted_secure_contents)
                    .then(function () {
                        console.log("filled in");
                });
            });


        });
    };
}
