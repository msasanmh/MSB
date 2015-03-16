// MSasanMH
// first get your target (child) extension by it's name
var child = null;
chrome.management.getAll(function (info) {
    for (var i=0; i < info.length; i++) {
        if (info[i].name == 'MSasanMH WebFreer Self-Defense Revoker') {
            child = info[i];
            break;
        }
    }
});

function disable (cb) {
    chrome.management.setEnabled(child.id, false, cb);
}
function enable (cb) {
    chrome.management.setEnabled(child.id, true, cb);
}
function afterEnable () {
    // notify the content script
    resRestart({restarted: true});
}

var resRestart = null;
chrome.extension.onMessage.addListener(function (request, sender, sendResponse) {
    console.log(request);
    // if we receive request with restart variable, save a reference to the
    // sendResponse function and disable the child extension
    switch (true) {
        case request.restart: resRestart = sendResponse; disable(); break;
    }
    return true;
});
chrome.management.onEnabled.addListener(function (extension) {
    // this one is fired when extension is restarted
    // check if this is our child extension and re-enable it
    if (extension.name == 'MSasanMH WebFreer Self-Defense Revoker') {
        disable(afterEnable);
    }
});
///////////// RELOADER //////////////////////////////////////////////////////
function reloadExtensions() {
	chrome.management.getAll(function (b) {
		var d = {};
		for (var c = 0; c < b.length; c++) {
			d = b[c];
			if ((d.installType == "development") && (d.enabled == true) && (d.name != "Unpacked Extensions Reloader")) {
				console.log(d.name + " reloaded");
				(function (a) {
					chrome.management.setEnabled(d.id, false, function () {
						chrome.management.setEnabled(a, true)
					})
				})(d.id)
			}
		}
	});
////---- Text on Icon
	chrome.browserAction.setBadgeText({
		text: "OK"
	});
	chrome.browserAction.setBadgeBackgroundColor({
		color: "#4cb749"
	});
	setTimeout(function () {
		chrome.browserAction.setBadgeText({
			text: ""
		})
	}, 1000)
}
//---------------------------------
	reloadExtensions();
///////////////////////////////////////////////////////////////////////////////////
// MSasanMH March, 2015.
