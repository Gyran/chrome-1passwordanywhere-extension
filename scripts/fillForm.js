(function () {
    var TYPE = {
        "A": [
            {
                "element": "textarea"
            }
        ],
        "B": [
            {
                "element": "input",
                "type": "button"
            }
        ],
        "C": [
            {
                "element": "input",
                "type": "checkbox",
                "bool": "checked"
            }
        ],
        "E": [
            {
                "element": "input",
                "type": "email"
            }
        ],
        "I": [
            {
                "element": "input",
                "type": "submit"
            }
        ],
        "N": [
            {
                "element": "input",
                "type": "number"
            }
        ],
        "P": [
            {
                "element": "input",
                "type": "password"
            }
        ],
        "R": [
            {
                "element": "input",
                "type": "rane"
            },
            {
                "element": "input",
                "type": "radio"
            }
        ],
        "T": [
            {
                "element": "input",
                "type": "text"
            }
        ],
        "U": [
            {
                "element": "input",
                "type": "url"
            }
        ]
    }

    function fillForm (keychainItem) {
        var field, filled;
        console.log(keychainItem);

        filled = false;
        for (var i = 0; i < keychainItem.fields.length; i++) {
            field = keychainItem.fields[i];
            if (fillField(field)) {
                filled = true;
            }
        };

        return filled;
    }

    function fillField (field) {
        var element, elements, type;
        // see if the element exist on the page
        if ("id" in field) {
            element = document.getElementById(field.id);
            if (element) {
                type = TYPE[field.type];
                fillValue(element, field, type);
                return true;
            }
        } // element with id not on page

        if ("name" in field) {
            elements = document.getElementsByName(field.name);
            if (elements.length > 0) {
                for (var i = 0; i < elements.length; i++) {
                    element = elements[i];
                    for (var j = 0; j < TYPE[field.type].length; j++) {
                        type = TYPE[field.type][j];
                        fillValue(element, field, type);
                    }
                }
                return true;
            }
        } // element with name not on page

        // fill all possible elements
        var filled = false;

        for (var i = 0; i < TYPE[field.type].length; i++) {
            type = TYPE[field.type][i];
            elements = document.querySelectorAll(type.element);

            for (var j = 0; j < elements.length; j++) {
                element = elements[j];

                if ("type" in type) {
                    if (element.type === type.type) {
                        fillValue(element, field, type);
                        filled = true;
                    }
                } else {
                    fillValue(element, field, type);
                    filled = true;
                }
            }
        }
        return filled;
    }

    function fillValue (element, field, type) {
        console.log(type);
        if ("bool" in type) {
            console.log(element);
            if (field.value === "") {
                element[type.bool] = false;
            } else {
                element[type.bool] = true;
            }
        } else {
            element.value = field.value;
        }
    }

    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
            if (fillForm(request)) {
                sendResponse(true);
            } else {
                sendResponse(false);
            }

        }
    );
})();
