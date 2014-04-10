(function () {
    var USERNAME_FIELDS = ["username", "user"];
    var PASSWORD_FIELDS = ["password", "pass"];

    function fillForm (keychainItem) {
        var designations = getDesignations(keychainItem.fields);

        if ("username" in designations) {
            fillField(designations.username, USERNAME_FIELDS);
        }
        if ("password" in designations) {
            fillField(designations.password, PASSWORD_FIELDS);
        }
    }

    function getDesignations (fields) {
        var designations = {};

        for (var index in fields) {
            var field = fields[index];

            if ("designation" in field) {
                designations[field.designation] = field;
            }
        }

        return designations;
    }

    function fillField(field, backupNames) {
        var element = null;

        // see if the element exist on the page
        if ("id" in field) {
            element = document.getElementById(field.id);
        }
        if ("name" in field) {
            backupNames.unshift(field.name);
        }

        if (!element) { // no element with that id
            for (var index in backupNames) {
                var name = backupNames[index];

                if (element) {
                    break; // found a match!
                }

                var selectorElement = "input";
                var selectorAttributes = [];
                if (field.type === "T") {
                    selectorAttributes.push(["name", name]);
                }if (field.type === "P") {
                    selectorAttributes.push(["name", name]);
                }

                var selector = selectorElement + "[";
                var divider = "";
                for (var attIndex in selectorAttributes) {
                    var selectorAttribute = selectorAttributes[attIndex];
                    selector += divider + "" + selectorAttribute[0] + "='" + selectorAttribute[1] + "'";
                    divider = ",";
                }
                selector += "]";

                element = document.querySelector(selector);
            }
        }

        if (!element) { // could not find any from backup

        }


        if (element) {
            element.value = field.value;
        }
    }

    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
            fillForm(request);
        }
    );
})();
