chrome.tabs.onUpdated.addListener(
    function(tabId, changeInfo, tab)
    {
        if ( tab.url.match('^https?://[.*\.]?thepiratebay.se/')[0] )
        {
            chrome.pageAction.show( tabId );
            chrome.contentSettings.javascript.set(
            {
                'primaryPattern': 'http://thepiratebay.se/*',
                'setting': 'block'
            });
        }
    }
);
