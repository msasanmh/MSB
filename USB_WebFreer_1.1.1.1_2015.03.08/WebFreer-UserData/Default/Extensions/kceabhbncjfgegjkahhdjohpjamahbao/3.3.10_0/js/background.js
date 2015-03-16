var manifest;
var email;
var showingNotificationInProcess = false;

chrome.notifications.onClicked.addListener(function(notificationId) {
	chrome.tabs.create({url:"http://jasonsavard.com/checkerPlusForGmail?ref=WABNotification"});
	chrome.notifications.clear("adForCheckerPlusForGmail", function() {});
});

chrome.notifications.onButtonClicked.addListener(function(notificationId, buttonIndex) {
	chrome.tabs.create({url:"http://jasonsavard.com/checkerPlusForGmail?ref=WABNotification"});
	chrome.notifications.clear("adForCheckerPlusForGmail", function() {});
});

chrome.alarms.onAlarm.addListener(function(alarm) {
	if (!localStorage.adForCheckerPlusForGmailShown) {
		var options = {
			  type: "basic",
			  priority: 2,
			  title: "Webmail Ad Blocker news",
			  message: "Thank you for using WAB! You may be interested in my Gmail checker extension: It offers desktop, sound & voice notifications while avoiding ads and the Gmail website!",
			  iconUrl: "images/notificationIcon.png",
			  buttons: [{title:"Click to see: Checker Plus for Gmail"}]
		}
		chrome.notifications.create("adForCheckerPlusForGmail", options, function(notificationId) {
			localStorage.adForCheckerPlusForGmailShown = true;
		});
	}
});

function diffInDays(date1, date2) {
	var d1 = new Date(date1);
	d1.setHours(1);
	d1.setMinutes(1);
	var d2 = new Date(date2);
	d2.setHours(1);
	d2.setMinutes(1);
	return Math.round(Math.ceil(d2.getTime() - d1.getTime()) / 60000 / 60 / 24);
}

chrome.runtime.onMessage.addListener(
     function(request, sender, sendResponse) {
		switch (request.name) {
			case "getLocalStorage":
				sendResponse(
					{
						ls : localStorage,
					}
				);
				break;
			case "setLocalStorage":
				localStorage[request.key] = request.value;
				sendResponse(
					{
						blah : "blah",
					}
				);
				break;
			case "sendGA":
				sendGA(request.value);
				break;
			case "saveEmail":
				email = request.email;
				break;
			case "showNotification":
				
				/*
				 	-detect not already using gmail extension
					-detect gmail user
					-detect old time user
					-delay before showing notification
					-do not show more than once
				 */
				
				if (!showingNotificationInProcess) {
					showingNotificationInProcess = true;
					
					if (!localStorage.adForCheckerPlusForGmailShown) {
						
						var installDate
						if (localStorage["installDate"]) {
							installDate = new Date(localStorage["installDate"]);
						} else {
							installDate = new Date();
						}
						
						if (diffInDays(installDate, new Date()) > 7) { // longer than a week
							
							// make sure user doesn't already have gmail checker 
							chrome.runtime.sendMessage("oeopbcgkkoapgobdbedcemjljbihmemj", {}, function(response) {
							    if (response && response.installed) {
							    	// installed so do nothing
							    } else {
							    	chrome.alarms.create("adForCheckerPlusForGmailAlarm", {delayInMinutes:1});
							    }
							});
						}
						
					}
				}
				break;
			case "insertCSS":
				chrome.tabs.insertCSS(null, {code:request.css, allFrames:true}, function() {
					alert('inserted done')
				});
				break;
		}
     }
);

chrome.runtime.onInstalled.addListener(function(details) {
	if (details.reason == "install") {
		localStorage["installDate"] = new Date();
		localStorage["installVersion"] = chrome.runtime.getManifest().version;
		chrome.tabs.create({url:"http://jasonsavard.com/?ref=WABChromeInstall"});
	} else if (details.reason == "update") {
		// do nothing
	}
});

if (chrome.runtime.setUninstallURL) {
	chrome.runtime.setUninstallURL("http://jasonsavard.com/uninstalled?app=wab");
}