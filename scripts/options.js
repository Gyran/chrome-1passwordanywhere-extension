function save () {
    var baseurl = document.getElementById("baseurl").value;

    chrome.storage.sync.set({
        "baseurl": baseurl
    }, function () {
        var status = document.getElementById("status");
        status.textContent = "Options saved";
        setTimeout(function () {
            status.textContent = "";
        }, 750);
    });
}

function restore () {
    // default: https://dl-web.dropbox.com/get/1password/1Password.agilekeychain/data/default/
    chrome.storage.sync.get({
        "baseurl": "https://dl-web.dropbox.com/get/1password/1Password.agilekeychain/data/default/"
    }, function (items) {
        document.getElementById("baseurl").value = items.baseurl;
    });
}

document.addEventListener("DOMContentLoaded", restore);
document.getElementById("save").addEventListener("click", save);
