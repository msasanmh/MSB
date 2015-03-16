/* 
    Better Pop Up Blocker
    Copyright (C) 2010  Eric Wong	
	contact@optimalcycling.com
	http://www.optimalcycling.com

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/


// Save the function pointers to the javascript functions we are going to manipulate.
// Then, set them to null. This is done at the very beginning because below, sendRequest is asynchronous
// and will let other javascript code execute while it's waiting. 
// We also remove the javascript we inject into the page using a special trick so that others cannot parse the page 
// and see our variable names in the global space that can be used to try to bypass our blocker.
// I hope Google Chrome and Apple Safari will get a better way to access settings from user scripts because even canLoad doesn't apply here.

// First generate random id's for our function pointers
const nameWindowOpen = randomID();
const nameWindowShowModelessDialog = randomID();
const nameWindowShowModalDialog = randomID();
const nameWindowPrompt = randomID();
const nameWindowConfirm = randomID();
const nameWindowAlert = randomID();	
const nameWindowMoveTo = randomID();
const nameWindowMoveBy = randomID();
const nameWindowResizeTo = randomID();
const nameWindowResizeBy = randomID();
const nameWindowScrollBy = randomID();
const nameWindowScrollTo = randomID();
const nameWindowBlur = randomID();
const nameWindowFocus = randomID();
const nameDocumentGetSelection = randomID();
const nameWindowGetSelection = randomID();
const nameWindowOnUnLoad = randomID();
const nameWindowPrint = randomID();

// For blocked pop up windows so we know what was blocked
var namesLastBlockedOpenDiv = new Array();
const numRememberLastBlocked = 3;
for (var i = 0; i < numRememberLastBlocked; i++)
{
	namesLastBlockedOpenDiv.push(randomID());
}
const classLastBlockedOpenDiv = randomID();
const nameLastBlockedOpenEvent = randomID();



const obfusPartsID = randomID();

// Next, we create and javascript to inject into the current page to create the function pointers
var obfusParts1 = [
	nameWindowOpen + "=window.open;",
	nameWindowShowModelessDialog + "=window.showModelessDialog;",
	nameWindowShowModalDialog + "=window.showModalDialog;",
	
	nameWindowPrompt + "=window.prompt;", 
	nameWindowConfirm + "=window.confirm;", 
	nameWindowAlert + "=window.alert;",
	
	nameWindowMoveTo + "=window.moveTo;",	
	nameWindowMoveBy + "=window.moveBy;",
	nameWindowResizeTo + "=window.resizeTo;",
	nameWindowResizeBy + "=window.resizeBy;",
	nameWindowScrollBy + "=window.scrollBy;",
	nameWindowScrollTo + "=window.scrollTo;",
	nameWindowBlur + "=window.blur;",
	nameWindowFocus + "=window.focus;",
	
	nameDocumentGetSelection + "=document.getSelection;",
	nameWindowGetSelection + "=window.getSelection;",
	
	nameWindowOnUnLoad + "=window.onunload;",
	
	nameWindowPrint + "=window.print;"	
];

// Dummy place holders to increase the numbers
var numDummies = 5 + Math.floor(Math.random() * 11);	// minimum 5, max 15
for (var i = 0; i < numDummies; i++)
{
	obfusParts1.push(randomID() + "=new Function();");
}

// Randomize the order of our function pointers in memory
fisherYatesShuffle(obfusParts1);

// The part of the javascript that sets the current javascript functions to null and cleans up the code
var obfusParts2 = [
	"window.open=new Function();window.showModelessDialog=null;window.showModalDialog=null;window.prompt=null;window.confirm=null;window.alert=null;",
	"window.moveTo=null;window.moveBy=null;window.resizeTo=null;window.resizeBy=null;window.scrollBy=null;window.scrollTo=null;window.blur=null;window.focus=null;",
	"document.getSelection=null;window.getSelection=null;window.onunload=null;window.print=null;",
	
	"(function(){var ourScript=document.getElementsByTagName('script');for(var i=0; i < ourScript.length; i++){if(ourScript[i].id && ourScript[i].id === '", 
	obfusPartsID, "'){ourScript[i].parentNode.removeChild(ourScript[i]);break;}}})();"
];

// Now we inject the javascript into the page
injectGlobalWithId(obfusParts1.join("") + obfusParts2.join(""), obfusPartsID);

// In Safari, we have to make a call to tell the browser to update the browser button or it will show the wrong one on load of a new page
var firstBeforeLoad = true;
if (SAFARI)
{
	// Get the settings by catching the beforeload event for an Object
	// This method doesn't fulfil our needs of getting the settings back from the background page before
	// other scripts execute.
	//document.addEventListener("beforeload", handleBeforeLoadEvent, true);
	
	if (window.top === window)
	{
		chrome.extension.sendRequest({type: "safari validate", url: window.location.href});
	}
}
// Uncomment "else" below if testing the "beforeload" method for getting settings
//else	
{
	// Call our background page and get the settings.
	// sendRequest is asynchronous so some things may load while we wait.
	//if (window.top === window)
		chrome.extension.sendRequest({type: "get settings block start", url: window.location.href}, coreLogic);
	//else	// Google Chrome doesn't let us get the parent frame url
		//chrome.extension.sendRequest({type: "get settings block start", url: top.window.location}, coreLogic);
}

/*
For Safari only when using the "beforeload" method.
*/
function handleBeforeLoadEvent(event)
{
	if (SAFARI && firstBeforeLoad)
	{
		firstBeforeLoad = false;
		var theSettings = safari.self.tab.canLoad(event, {type: "get settings block start", url: window.location.href});
		coreLogic(theSettings);
	}
}

/*
Takes the settings and unblocks our blocked javascript functions as necessary.
Also, it blocks those javascript functions we didn't block at the very beginning of this script for website compatibility reasons.
settins: A json object containing our settings.
*/
function coreLogic(settings) {
	var deblockingScripts = new Array();
	
	if (settings.enabled || !settings.blockWindowOpen)
	{ 
		var nameMaxCount = randomID();
		var nameWindowsOpenCount = randomID();

		var deblockParts = [
			"const ", nameMaxCount, "=30;",
			"var ", nameWindowsOpenCount, "=0;",
			
			"window.open = function () { if(", nameWindowsOpenCount, " < ", nameMaxCount, ") {", nameWindowsOpenCount, "++;",
			"if (!arguments || arguments.length == 0) return ", nameWindowOpen, "(); ",
			"else if (arguments.length == 1) return ", nameWindowOpen, "(arguments[0]); ",
			"else if (arguments.length == 2) return ", nameWindowOpen, "(arguments[0], arguments[1]);",
			"else if (arguments.length == 3) return ", nameWindowOpen, "(arguments[0], arguments[1], arguments[2]);",	
			"else if (arguments.length == 4) return ", nameWindowOpen, "(arguments[0], arguments[1], arguments[2], arguments[3]);} return true; };",	

			"window.showModelessDialog = function () { if(", nameWindowsOpenCount, " < ", nameMaxCount, ") {", nameWindowsOpenCount, "++; ", 
			"if (arguments.length == 1) return ", nameWindowShowModelessDialog, "(arguments[0]); ",
			"else if (arguments.length == 2) return ", nameWindowShowModelessDialog, "(arguments[0], arguments[1]); ", 
			"else if (arguments.length == 3) return ", nameWindowShowModelessDialog, "(arguments[0], arguments[1], arguments[2]);} return true; };",		

			"window.showModalDialog = function () { if(", nameWindowsOpenCount, " < ", nameMaxCount, ") {", nameWindowsOpenCount, "++; ", 
			"if (arguments.length == 1) return ", nameWindowShowModalDialog, "(arguments[0]); ",
			"else if (arguments.length == 2) return ", nameWindowShowModalDialog, "(arguments[0], arguments[1]); ", 
			"else if (arguments.length == 3) return ", nameWindowShowModalDialog, "(arguments[0], arguments[1], arguments[2]);} return true; };"				
		];
		
		deblockingScripts.push(deblockParts.join(""));
	}
	else	// We want to block, so clear unneeded variables.
	{ 
		for (var i = 0; i < numRememberLastBlocked; i++)
		{
			var lastBlockedDiv = document.createElement('div');
			//lastBlockedDiv.style.visibility = 'hidden';	// Don't do this. We can't get the innerText afterwards.
			lastBlockedDiv.style.display = 'none';	// This makes the div hidden but the text is still retrievable.
			lastBlockedDiv.id = namesLastBlockedOpenDiv[i];
			lastBlockedDiv.className = classLastBlockedOpenDiv;
			lastBlockedDiv.innerHTML = '';
			lastBlockedDiv.innerText = ''; 
			document.documentElement.appendChild(lastBlockedDiv);
		}
	
		var nameMaxCount = randomID();
		var nameWindowsOpenCount = randomID();
		
		var deblockParts = [
			"const ", nameMaxCount, "=30;",
			"var ", nameWindowsOpenCount, "=0;",
			
			"window.open = function() {var dummyOpen = { close: function(){return true;}, test: function(){return true;}, closed: false, innerHeight: 480, innerWidth: 640};", 
			"try{ if(", nameWindowsOpenCount, " < ", nameMaxCount, ") {", nameWindowsOpenCount, 
			"++; if (!arguments || arguments.length == 0 || arguments.length == 1 || arguments.length == 2 || arguments.length == 3 || arguments.length == 4) {", 
			"var fullBlockedUrl = null;",
			"if (!arguments || arguments.length === 0 || arguments[0] === null || arguments[0] === '' || arguments[0] === 'about:blank') fullBlockedUrl = 'about:blank';",
			"else fullBlockedUrl = (arguments[0].indexOf('http')===0 ? arguments[0] : (window.location.protocol + '//' + window.location.hostname + '/' + arguments[0]));",
			
			"switch (", nameWindowsOpenCount, " % 3) {",
			"case 0: document.getElementById('", namesLastBlockedOpenDiv[0], "').innerText = fullBlockedUrl; break;",
			"case 1: document.getElementById('", namesLastBlockedOpenDiv[1], "').innerText = fullBlockedUrl; break;",
			"case 2: document.getElementById('", namesLastBlockedOpenDiv[2], "').innerText = fullBlockedUrl; break; }",
			
			// Fire an event to tell the extension we blocked something
			"var customEvent = document.createEvent('Event'); customEvent.initEvent('", nameLastBlockedOpenEvent, 
			"', true, true); document.dispatchEvent(customEvent);",
			
			"} } return dummyOpen; } catch(err) {return dummyOpen;} };",	

			
			"window.showModelessDialog = function() { try{ if(", nameWindowsOpenCount, " < ", nameMaxCount, ") {", nameWindowsOpenCount, "++; if ((arguments.length == 1 || arguments.length == 2 || arguments.length == 3) && arguments[0]) {", 
			"var fullBlockedUrl = (arguments[0].indexOf('http')===0 ? arguments[0] : (window.location.protocol + '//' + window.location.hostname + '/' + arguments[0]));",
			
			"switch (", nameWindowsOpenCount, " % 3) {",
			"case 0: document.getElementById('", namesLastBlockedOpenDiv[0], "').innerText = fullBlockedUrl; break;",
			"case 1: document.getElementById('", namesLastBlockedOpenDiv[1], "').innerText = fullBlockedUrl; break;",
			"case 2: document.getElementById('", namesLastBlockedOpenDiv[2], "').innerText = fullBlockedUrl; break; }",
			
			"var customEvent = document.createEvent('Event'); customEvent.initEvent('", nameLastBlockedOpenEvent, 
			"', true, true); document.dispatchEvent(customEvent);",			
			
			"} } return true; } catch(err) {return true;} };",			
			
			
			"window.showModalDialog = function() { try{ if(", nameWindowsOpenCount, " < ", nameMaxCount, ") {", nameWindowsOpenCount, "++; if ((arguments.length == 1 || arguments.length == 2 || arguments.length == 3) && arguments[0]) {", 
			"var fullBlockedUrl = (arguments[0].indexOf('http')===0 ? arguments[0] : (window.location.protocol + '//' + window.location.hostname + '/' + arguments[0]));",
			
			"switch (", nameWindowsOpenCount, " % 3) {",
			"case 0: document.getElementById('", namesLastBlockedOpenDiv[0], "').innerText = fullBlockedUrl; break;",
			"case 1: document.getElementById('", namesLastBlockedOpenDiv[1], "').innerText = fullBlockedUrl; break;",
			"case 2: document.getElementById('", namesLastBlockedOpenDiv[2], "').innerText = fullBlockedUrl; break; }",
			
			"var customEvent = document.createEvent('Event'); customEvent.initEvent('", nameLastBlockedOpenEvent, 
			"', true, true); document.dispatchEvent(customEvent);",
			
			"} } return true; } catch(err) {return true;} };",
			
			nameWindowOpen, "=new Function();",
			nameWindowShowModelessDialog, "=new Function();",
			nameWindowShowModalDialog, "=new Function();"
		];

		deblockingScripts.push(deblockParts.join(""));
	}
	
	if (settings.enabled || !settings.blockWindowPrompts)
	{  
		var nameMaxCount = randomID();
		var nameWindowAlertsPromptsCount = randomID();	
	
		var deblockParts = [
			"const ", nameMaxCount, "=30;",
			"var ", nameWindowAlertsPromptsCount, "=0;",
			
			"window.prompt = function (promptText) { if(", nameWindowAlertsPromptsCount, " < ", nameMaxCount, ") {", nameWindowAlertsPromptsCount, "++; return ", 
			nameWindowPrompt, "(promptText);} return null;};",
			
			"window.confirm = function (confirmText) { if(", nameWindowAlertsPromptsCount, " < ", nameMaxCount, ") {", nameWindowAlertsPromptsCount, "++; return ", 
			nameWindowConfirm, "(confirmText);} return null;};",			
			
			"window.alert = function (alertText) { if(", nameWindowAlertsPromptsCount, " < ", nameMaxCount, ") {", nameWindowAlertsPromptsCount, "++; ", 
			nameWindowAlert, "(alertText);} return true;};",									
		];
		deblockingScripts.push(deblockParts.join(""));	
	}
	else
	{  
		var deblockParts = [
			nameWindowPrompt, "=new Function();",
			nameWindowConfirm, "=new Function();",
			nameWindowAlert, "=new Function();"	
		];
		
		deblockingScripts.push(deblockParts.join(""));
	}	

	if (settings.enabled || !settings.blockWindowMovingAndResize)
	{
		var deblockParts = [
			"window.moveTo=", nameWindowMoveTo, ";",
			"window.moveBy=", nameWindowMoveBy, ";",
			"window.resizeTo=", nameWindowResizeTo, ";",
			"window.resizeBy=", nameWindowResizeBy, ";",
			"window.scrollBy=", nameWindowScrollBy, ";",
			"window.scrollTo=", nameWindowScrollTo, ";",
			"window.blur=", nameWindowBlur, ";",
			"window.focus=", nameWindowFocus, ";"
		];
		deblockingScripts.push(deblockParts.join(""));	
	}
	else
	{  
		var deblockParts = [
			nameWindowMoveTo, "=new Function();",
			nameWindowMoveBy, "=new Function();",
			nameWindowResizeTo, "=new Function();",
			nameWindowResizeBy, "=new Function();",
			nameWindowScrollBy, "=new Function();",
			nameWindowScrollTo, "=new Function();",
			nameWindowBlur, "=new Function();",
			nameWindowFocus, "=new Function();"
		];
		
		deblockingScripts.push(deblockParts.join(""));
	}	
	
	if (settings.enabled || !settings.blockJSSelection)
	{
		var deblockParts = [
			"document.getSelection=", nameDocumentGetSelection, ";",
			"window.getSelection=", nameWindowGetSelection, ";"
		];
		deblockingScripts.push(deblockParts.join(""));	
	}
	else
	{  
		var deblockParts = [
			nameDocumentGetSelection, "=new Function();",
			nameWindowGetSelection, "=new Function();"
		];
		
		deblockingScripts.push(deblockParts.join(""));
	}	
	
	if (settings.enabled || !settings.blockOnUnload)
	{
		var deblockParts = [
			"window.onunload=", nameWindowOnUnLoad, ";"
		];
		deblockingScripts.push(deblockParts.join(""));
	}	
	else
	{  
		var deblockParts = [
			nameWindowOnUnLoad, "=new Function();"
		];
		
		deblockingScripts.push(deblockParts.join(""));
	}		
	
	if (settings.enabled || !settings.blockJSPrint)
	{
		var nameMaxCount = randomID();
		var nameWindowPrintsCount = randomID();

		var deblockParts = [
			"const ", nameMaxCount, "=30;",
			"var ", nameWindowPrintsCount, "=0;",
			
			"window.print = function () { if(", nameWindowPrintsCount, " < ", nameMaxCount, ") {", nameWindowPrintsCount, "++; ", 
			nameWindowPrint, "();} };"
		];
		deblockingScripts.push(deblockParts.join(""));
	}
	else
	{  
		var deblockParts = [
			nameWindowPrint, "=new Function();"
		];
		
		deblockingScripts.push(deblockParts.join(""));
	}	
	
	// These functions are not blocked at the very beginning because some websites use them on load or
	// while we wait for sendMessage. Done to maintain best compatibility.
	if (!settings.enabled)
	{
		if (settings.blockCreateEvents)
			deblockingScripts.push("document.createEvent = null;");
		if (settings.blockUnescapeEval)
			deblockingScripts.push("unescape = null; eval = null;");
		if (settings.blockJSTimers)
			deblockingScripts.push("window.setTimeout = null; window.setInterval = null;");
	}
	
	// Inject deblocking code and cleanup
	{
		var deblockID = randomID();
		var deblockParts = [
			"(function(){var ourScript=document.getElementsByTagName('script');for(var i=0; i < ourScript.length; i++){if(ourScript[i].id && ourScript[i].id === '", 
			deblockID, "') {ourScript[i].parentNode.removeChild(ourScript[i]); break;}}})();"		
		];
		deblockingScripts.push(deblockParts.join(""));
		injectGlobalWithId(deblockingScripts.join(""), deblockID);
	}
	
	// For now, we will only communicate the blocked pop ups from the top window, ie: no iFrames
	// chrome.tabs.sendRequest used to communicate from the extension only sends to the top level window
	if (window.top === window)
	{		
		if (SAFARI)
		{
			// I believe dispatchMessage is asynchronous, unlike canLoad which is blocking. 
			// Therefore, we have to send messages back instead of putting it in event.message.
			// safari.self.tab.dispatchMessage("get last blocked", "data");
			// safari.application.activeBrowserWindow.activeTab.page.dispatchMessage("get last blocked", "data");
			// safari.self.tabs[0].page.dispatchMessage("get last blocked", "data");
			safari.self.addEventListener("message", function(event) { 
				switch (event.name) {
					case "get last blocked":
						var msg = event.message;
						try
						{			
							var lastBlocked = new Array();
							for (var i = 0; i < numRememberLastBlocked; i++)
							{
								lastBlocked.push(document.getElementById(namesLastBlockedOpenDiv[i]).innerText);
							}
							//event.message = {url: lastBlocked, error: null};		  
							chrome.extension.sendRequest({type: "window pop up blocked response", index: msg.index, url: lastBlocked, error: null});
						}
						catch (err)
						{
							//event.message = {url: "Error", error: err};
							chrome.extension.sendRequest({type: "window pop up blocked response", index: msg.index, url: "Error", error: err});
						}						
						break;
				}			
			}, false);	
		}
		else
		{
			// Safari does not like the following listener in this content script for some reason. It won't run it.
			// Will have to use the Safari specific way.
			chrome.extension.onRequest.addListener(
			  function(msg, src, send) {
				if (msg.type === "get last blocked")
				{
					try
					{			
						var lastBlocked = new Array();
						for (var i = 0; i < numRememberLastBlocked; i++)
						{
							lastBlocked.push(document.getElementById(namesLastBlockedOpenDiv[i]).innerText);
						}
						send({url: lastBlocked, index: msg.index, error: null});		  
					}
					catch (err)
					{
						send({url: "Error", index: msg.index, error: err});
					}
				}  
				else
					send({});
			  });
		}		  
		  
		document.addEventListener(nameLastBlockedOpenEvent, function() {
			chrome.extension.sendRequest({type: "window pop up blocked"});		
		}, true);			  
	}
}	


function injectAnon(f) {
    var script = document.createElement("script");
	script.type = "text/javascript";
    script.textContent = "(" + f + ")();";
    document.documentElement.appendChild(script);
}

function injectGlobal(f) {
    var script = document.createElement("script");
	script.type = "text/javascript";
    script.textContent = f;
    document.documentElement.appendChild(script);
}

function injectGlobalWithId(f, id) {
    var script = document.createElement("script");
	script.type = "text/javascript";
	script.id = id;
    script.textContent = f;
    document.documentElement.appendChild(script);
}
	
/*
Returns a random string suitable for use as an id in html/javascript code.
Length is hardcoded to be between 15 and 25 characters
*/
function randomID()
{
	const length = 15 + Math.floor(Math.random() * 11);	// minimum 15, max 25
	const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_1234567890";	// total 63 characters
	var generated = chars.charAt(Math.floor(Math.random() * 53)); 

	for(var x=0;x<length;x++)
		generated += chars.charAt(Math.floor(Math.random() * 63));
		
	return generated;
}

/*
Takes in an array and shuffles it randomly in place using the Fisher Yates algorithm
array: Any array.
*/
function fisherYatesShuffle ( array ) 
{
	if (!array) return;
	var i = array.length;
	if (!i) return;
	
	while ( --i ) {
		var j = Math.floor( Math.random() * ( i + 1 ) );
		var tempi = array[i];
		var tempj = array[j];
		array[i] = tempj;
		array[j] = tempi;
	}
}

