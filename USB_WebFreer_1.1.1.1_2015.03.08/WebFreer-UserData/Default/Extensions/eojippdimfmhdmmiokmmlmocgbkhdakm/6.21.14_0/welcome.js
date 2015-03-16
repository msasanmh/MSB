
function openNewTab(event)
{
    chrome.tabs.create({ url: event.target.href });
    return false;
}

function onLoad(event)
{
    var param = {};
    var list = window.location.search.substr(1).split('&');
    
    while (list.length)
    {
	var pair = list.shift().split('=', 2);
	param[pair[0]] = pair[1];
    }
    
    msgInstalled.style.display = param.previous ? 'none' : '';
    msgUpdated.style.display = param.previous ? '' : 'none';
    msgIncognitoAccess.style.display = param.incognito ? 'none' : '';
    msgIdmNotInstalled.style.display = param.manager ? 'none' : '';
    msgRemoveObsolete.style.display = param.obsolete ? '' : 'none';

    linkContactSupport.href += window.location.search;
    linkExtensions.onclick = openNewTab;
}

window.onload = onLoad;
