String.prototype.trim = function () {
    return this.replace(/^\s*/, "").replace(/\s*$/, "");
}

function $(id) { return document.getElementById(id); }
function lines(s) 
{ 
	var links = (s ? s.split('\n') : []); 
	if (links)
	{
		for (var i = 0; i < links.length; i++)
		{
			if (links[i])
				links[i] = links[i].trim();
			if (!links[i] || links.length === 0)
			{
				links.splice(i, 1);
				i--;
			}			
		}
		links.sort();
	}
	return links;
}

function init() {
	$('highlight').innerText = "Ver. " + config.get('currDisplayVersion') + " - " + $('highlight').innerText;
	$('useBlacklistMode').checked = config.get('useBlacklistMode');	
	
    $('whitelist').value = whitelist.join('\n');
	$('blacklist').value = blacklist.join('\n');
	showHideLists();
	
	$('blockWindowOpen').checked = config.get('blockWindowOpen');	
	$('closeAllPopUpWindows').checked = config.get('closeAllPopUpWindows');	
	
	$('blockWindowPrompts').checked = config.get('blockWindowPrompts');	
	$('blockJSContextMenuAndClickIntercept').checked = config.get('blockJSContextMenuAndClickIntercept');
		
	$('blockWindowMovingAndResize').checked = config.get('blockWindowMovingAndResize');	
	$('blockUnescapeEval').checked = config.get('blockUnescapeEval');	
	$('blockJSSelection').checked = config.get('blockJSSelection');	
	$('blockJSTimers').checked = config.get('blockJSTimers');	
	$('blockJSPrint').checked = config.get('blockJSPrint');	
	$('blockOnUnload').checked = config.get('blockOnUnload');	
	$('blockWindowTargets').checked = config.get('blockWindowTargets');	
	$('reloadCurrentTabOnToggle').checked = config.get('reloadCurrentTabOnToggle');	
	
	$('extendedTooltips').checked = config.get('extendedTooltips');
	$('stripJSFromLinkLocations').checked = config.get('stripJSFromLinkLocations');
	$('showBlockedBlinks').checked = config.get('showBlockedBlinks');
	
	$('showPageActionButton').checked = config.get('showPageActionButton');
	
	if (SAFARI)
	{
		$('showPageActionButton').enabled = false;
		$('showPageActionButton').style.display = 'none';
		$('div_showPageActionButton').style.display = 'none';
	}	
	
	$('blockCreateEvents').checked = config.get('blockCreateEvents');	
	
	showReadyButtons();
}

function save() {
	config.set('useBlacklistMode', $('useBlacklistMode').checked);
	
    config.set('whitelist', lines($('whitelist').value));
	$('whitelist').value = config.get('whitelist').join('\n');
	
    config.set('blacklist', lines($('blacklist').value));
	$('blacklist').value = config.get('blacklist').join('\n');	
	
	config.set('blockWindowOpen', $('blockWindowOpen').checked);	
	config.set('closeAllPopUpWindows', $('closeAllPopUpWindows').checked);
	
	config.set('blockWindowPrompts', $('blockWindowPrompts').checked);	
	config.set('blockJSContextMenuAndClickIntercept', $('blockJSContextMenuAndClickIntercept').checked);
	
	config.set('blockWindowMovingAndResize', $('blockWindowMovingAndResize').checked);
	config.set('blockUnescapeEval', $('blockUnescapeEval').checked);
	config.set('blockJSSelection', $('blockJSSelection').checked);
	config.set('blockJSTimers', $('blockJSTimers').checked);
	config.set('blockJSPrint', $('blockJSPrint').checked);
	config.set('blockOnUnload', $('blockOnUnload').checked);
	config.set('blockWindowTargets', $('blockWindowTargets').checked);	
	config.set('reloadCurrentTabOnToggle', $('reloadCurrentTabOnToggle').checked);	
	
	config.set('extendedTooltips', $('extendedTooltips').checked);	
	config.set('stripJSFromLinkLocations', $('stripJSFromLinkLocations').checked);
	config.set('showBlockedBlinks', $('showBlockedBlinks').checked);

	config.set('showPageActionButton', $('showPageActionButton').checked);	
	
	config.set('blockCreateEvents', $('blockCreateEvents').checked);	
	
	showSavedButtons();
}

function handleStorageChangeUpdateLists(event)
{
	//if (SAFARI)
		//alert("handleStorageChangeUpdateLists");
	if (event.key === "whitelist")
	{
		$('whitelist').value = config.get('whitelist').join('\n');
	}
	else if (event.key === "blacklist")
	{
		$('blacklist').value = config.get('blacklist').join('\n');
	}	
}

// Bug: Safari does not fire "storage" events
window.addEventListener("storage", handleStorageChangeUpdateLists, false);