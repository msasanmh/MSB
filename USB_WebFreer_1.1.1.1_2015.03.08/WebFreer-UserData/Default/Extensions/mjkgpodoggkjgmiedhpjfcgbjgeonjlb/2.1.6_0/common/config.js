var config = {
    has: function(key) {
        return key in localStorage;
    },
    get: function(key) {
        if (this.has(key)) {
            try {
                return JSON.parse(localStorage[key]);
            } catch(e) {
                return localStorage[key];
            }
        }
    },
    set: function(key, value) {
		try {
			localStorage[key] = JSON.stringify(value);
		} catch (err) {
			if (err == QUOTA_EXCEEDED_ERR) {
				alert('Storage quota exceeded for Better Pop Up Blocker.');
			}
		}
    },
    defaults: function(vals) {
        for (var key in vals) {
            if (!this.has(key)) {
                this.set(key, vals[key]);
            }
        };
    }
};

config.defaults({

    whitelist: ['http://www.hulu.com', 'http://hulu.com', '^(http[s]?:\\/\\/[a-z0-9\\._-]+\\.|http[s]?:\\/\\/)google\\.[a-z]+($|\\/)', 
		'^(http[s]?:\\/\\/[a-z0-9\\._-]+\\.|http[s]?:\\/\\/)youtube\\.[a-z]+($|\\/)', '^(http[s]?:\\/\\/[a-z0-9\\._-]+\\.|http[s]?:\\/\\/)apple\\.[a-z]+($|\\/)'],

	/* This is the old whitelist for versions before 1.2 that have incorrectly escaped regular expressions
    whitelist: ['http://www.hulu.com', 'http://hulu.com', '^(http[s]?:\/\/[a-z0-9\._-]+\.|http[s]?:\/\/)google\.[a-z]+($|\/)', 
		'^(http[s]?:\/\/[a-z0-9\._-]+\.|http[s]?:\/\/)youtube\.[a-z]+($|\/)', '^(http[s]?:\/\/[a-z0-9\._-]+\.|http[s]?:\/\/)pezcyclingnews\.[a-z]+($|\/)'],
	*/
	
	blacklist: [],
	
	globalAllowAll: false,
	
	blockWindowOpen: true,
	closeAllPopUpWindows: false,
	
	blockWindowPrompts: true,
	blockJSContextMenuAndClickIntercept: true,
	
	blockWindowMovingAndResize: true,
	blockUnescapeEval: false,
	blockJSSelection: true,
	blockJSTimers: false,
	blockJSPrint: true,	
	blockOnUnload: true,
	blockWindowTargets: false,
	reloadCurrentTabOnToggle: true,
	
	extendedTooltips: false,
	stripJSFromLinkLocations: true,
	
	blockCreateEvents: false,
	
	currVersion: 200001000,
	currDisplayVersion: "2.1.0",
	
	showPageActionButton: true,
	tempList: "",	// not currently used
	
	useBlacklistMode: false,
	showBlockedBlinks: true
});

/*function determineIfOldChrome()
{
	var splitVer = navigator.appVersion.match(/^[0-9]+\.[0-9]+/i);
	if (splitVer && splitVer.length > 0)
	{
		try 
		{
			var verNum = parseFloat(splitVer[0]);
			if (verNum < 5.0)	// Versions of Google Chrome less than 5 may not have the local storage events we want
				return true;
			else
				return false;
		}
		catch (err)
		{
			return false;
		}
	}
	else
	{
		return false;
	}
}*/

var isOldChrome = false;
//if (!SAFARI)
	//isOldChrome = determineIfOldChrome();

var whitelist = config.get('whitelist');
var blacklist = config.get('blacklist');
var urlsGloballyAllowed = config.get('globalAllowAll');
var useBlacklistMode = config.get('useBlacklistMode');

function handleStorageChange(event)
{
	//if (SAFARI)
		//alert("handleStorageChange");
	if (event.key === "whitelist")
	{
		whitelist = config.get('whitelist');
	}
	else if (event.key === "blacklist")
	{
		blacklist = config.get('blacklist');
	}
	else if (event.key === "globalAllowAll")
	{
		urlsGloballyAllowed = config.get('globalAllowAll');
	}
	else if (event.key === "useBlacklistMode")
	{
		useBlacklistMode = config.get('useBlacklistMode');
	}		
}

// Bug: Safari does not fire "storage" events
window.addEventListener("storage", handleStorageChange, false);

/*
RegExp.escape = function(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

// We must escape str to match correctly. The typical Internet code snippet incorrectly shows it without escaping.
String.prototype.startsWith = function(str) 
{return (this.match("^"+RegExp.escape(str))==str)};
String.prototype.endsWith = function(str) 
{return (this.match(RegExp.escape(str)+"$")==str)};
*/

String.prototype.trim = function () {
    return this.replace(/^\s*/, "").replace(/\s*$/, "");
};
/*String.prototype.trim = function(){return 
(this.replace(/^[\s\xA0]+/, "").replace(/[\s\xA0]+$/, ""))};*/
String.prototype.chunk = function(n) {
	if (typeof n=='undefined') n=2;
	return this.match(RegExp('.{1,'+n+'}','g'));
};


/*
Used to determine if a url matches a urlPattern.
url: URL to be tested. Must be in lower case.
urlPattern: The pattern to be matched. Must be in lower case.

Returns: Returns true if url starts with urlPattern. If urlPattern starts with a "^", then regular expression matching is used.
*/
function patternMatches(url, urlPattern)
{
	if (!url || !urlPattern)
		return false;
		
	if (RegExp('^\\^', 'i').test(urlPattern))
	{
		// To whitelist a whole domain: ^http[s]?:\/\/([^\.]+\.)*google.co.uk($|\/)
		return RegExp(urlPattern, 'i').test(url);			
	}
	else if (RegExp('^http[s]?:\/\/', 'i').test(urlPattern))
	{
		var startsMatch = (url.toLowerCase().indexOf(urlPattern.toLowerCase()) === 0 ? true : false);
		if (startsMatch)
		{
			if (url.length === urlPattern.length)	// exact match
				return true;
			else // url is longer than urlPattern
			{
				var nextChar = url.charAt(urlPattern.length);
				if (nextChar === "/" || nextChar === ":")
					return true;
				else
					return false;
			}
		}
		else
			return false;
	}
	else
	{
		var coreUrl = getPrimaryDomain(url);
		if (!coreUrl)
			return false;
		coreUrl = coreUrl.toLowerCase();
		urlPattern = urlPattern.toLowerCase();
		
		var endsMatch = false;
		var matchedIndex = coreUrl.indexOf(urlPattern);		
		if (matchedIndex >= 0 && (matchedIndex + urlPattern.length) === coreUrl.length)
		   endsMatch = true;
   
		if (!endsMatch)
			return false;
		if (coreUrl.length === urlPattern.length)
			return true;
		if (coreUrl.charAt(coreUrl.length - urlPattern.length - 1) === ".")
			return true;
		return false;
	}
}

function isAllowed(url)
{
	if (SAFARI)
			useBlacklistMode = config.get('useBlacklistMode');
	if (useBlacklistMode)
		return !isBlacklisted(url);
	else
		return isWhitelisted(url);
}

function revokeUrl(url)
{
	if (SAFARI)
			useBlacklistMode = config.get('useBlacklistMode');
	if (useBlacklistMode)
		addToBlacklist(url);
	else
		removeFromWhitelist(url)
}

function permitUrl(url)
{
	if (SAFARI)
			useBlacklistMode = config.get('useBlacklistMode');
	if (useBlacklistMode)
		removeFromBlacklist(url);
	else
		addToWhitelist(url);
}

function islisted(list, listName, url) {
	if (!list || !url)
		return false;
		
	var isOnList = false;
	for (var i = 0; i < list.length; i++)
	{
		isOnList = patternMatches(url, list[i]);
		
		if (isOnList)
			break;
	}
	return isOnList;
}

function addToList(list, listName, url) {	
	list.push(url.toLowerCase());
	
	// This is inefficient, we are saving the entire list each time
	config.set(listName, list);	
}

function removeFromList(list, listName, url) {
	var isOnList = false;
	for (var i = 0; i < list.length; i++)
	{
		isOnList = patternMatches(url, list[i]);
		
		if (isOnList)
		{
			list.splice(i, 1);
			i--;
		}
	}
	
	// This is inefficient, we are saving the entire list each time
	config.set(listName, list);
}

function isWhitelisted(url) {
	if (SAFARI || isOldChrome)
		whitelist = config.get('whitelist');
	return islisted(whitelist, "whitelist", url);	
}

function addToWhitelist(url) {	
	if (SAFARI || isOldChrome)
		whitelist = config.get('whitelist');
	addToList(whitelist, "whitelist", url);
}

function removeFromWhitelist(url) {
	if (SAFARI || isOldChrome)
		whitelist = config.get('whitelist');
	removeFromList(whitelist, "whitelist", url);
}

function isBlacklisted(url) {
	if (SAFARI || isOldChrome)
		blacklist = config.get('blacklist');
	return islisted(blacklist, "blacklist", url);
}

function addToBlacklist(url) {	
	if (SAFARI || isOldChrome)
		blacklist = config.get('blacklist');
	addToList(blacklist, "blacklist", url);
}

function removeFromBlacklist(url) {
	if (SAFARI || isOldChrome)
		blacklist = config.get('blacklist');
	removeFromList(blacklist, "blacklist", url);
}

/*
Example for http://www.google.com/something.html, this returns http://www.google.com. Returns null if no match is found.
*/
function getMainURL(currURL)
{
	if (!currURL)
		return;
	var splitURL = currURL.match(/^http[s]?:\/\/[^\.]+\.[^\/:]+/i);
	if (splitURL && splitURL.length > 0)
		return splitURL[0];
	else
		return null;	
}

/*
Example for http://maps.google.com/something.html or maps.google.com, this returns google.com. Returns null if no match is found.
http://www.w3schools.com/HTML/html_url.asp
*/
function getPrimaryDomain(currURL)
{
	if (!currURL)
		return null;
	
	currURL = currURL.toLowerCase();
	
	var knownForms = currURL.match(/([^\.\/]+\.(asia|biz|cat|coop|edu|info|eu.int|int|gov|jobs|mil|mobi|name|tel|travel|aaa.pro|aca.pro|acct.pro|avocat.pro|bar.pro|cpa.pro|jur.pro|law.pro|med.pro|eng.pro|pro|ar.com|br.com|cn.com|de.com|eu.com|gb.com|hu.com|jpn.com|kr.com|no.com|qc.com|ru.com|sa.com|se.com|uk.com|us.com|uy.com|za.com|com|ab.ca|bc.ca|mb.ca|nb.ca|nf.ca|nl.ca|ns.ca|nt.ca|nu.ca|on.ca|pe.ca|qc.ca|sk.ca|yk.ca|gc.ca|ca|gb.net|se.net|uk.net|za.net|net|ae.org|za.org|org|[^\.\/]+\.uk|act.edu.au|nsw.edu.au|nt.edu.au|qld.edu.au|sa.edu.au|tas.edu.au|vic.edu.au|wa.edu.au|act.gov.au|nt.gov.au|qld.gov.au|sa.gov.au|tas.gov.au|vic.gov.au|wa.gov.au|[^\.\/]+\.au))($|\/|:){1}/i);
	if (knownForms && knownForms.length > 1)
		return knownForms[1]
	else
	{		
		var splitURL = currURL.toLowerCase().match(/^http[s]?:\/\/([^\.]+\.[^\/:]+)/i);
		if (splitURL && splitURL.length > 1)
		{
			var splitURL2 = splitURL[1].match(/^www\.([^\.]+\.[^\/]+)/i);
			if (splitURL2 && splitURL2.length > 1)
				return splitURL2[1];
			else
				return splitURL[1]
		}
		else
		{
			return currURL;
		}
	}
}
