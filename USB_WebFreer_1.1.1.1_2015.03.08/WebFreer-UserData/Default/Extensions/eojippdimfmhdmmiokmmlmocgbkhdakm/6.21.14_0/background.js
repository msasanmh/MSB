
var plugin = document.getElementById('__IDM__');
if (plugin)
{
    plugin.Initialize(plugin);
    
    chrome.webRequest.onBeforeRequest.addListener(plugin.onBeforeRequest,         { urls: ['http://*/*'],  types: ['main_frame','sub_frame'] }, ['blocking']);
    chrome.webRequest.onBeforeRequest.addListener(plugin.onBeforeRequest,         { urls: ['https://*/*'], types: ['main_frame','sub_frame'] }, ['blocking','requestBody']);
    chrome.webRequest.onBeforeSendHeaders.addListener(plugin.onBeforeSendHeaders, { urls: ['http://*/*'],  types: ['object','image','main_frame','sub_frame','xmlhttprequest','other'] }, ['requestHeaders']);
    chrome.webRequest.onBeforeSendHeaders.addListener(plugin.onBeforeSendHeaders, { urls: ['https://*/*'], types: ['object','image','main_frame','sub_frame','xmlhttprequest','other'] }, ['blocking','requestHeaders']);
    chrome.webRequest.onHeadersReceived.addListener(plugin.onHeadersReceived,     { urls: ['http://*/*'],  types: ['image'] }, ['responseHeaders']);
    chrome.webRequest.onHeadersReceived.addListener(plugin.onHeadersReceived,     { urls: ['https://*/*'], types: ['object','image','main_frame','sub_frame','xmlhttprequest','other'] }, ['blocking','responseHeaders']);
    chrome.webRequest.onResponseStarted.addListener(plugin.onResponseStarted,     { urls: ['<all_urls>'],  types: ['object','image','main_frame','sub_frame','xmlhttprequest','other'] });
    chrome.webRequest.onErrorOccurred.addListener(plugin.onErrorOccurred,         { urls: ['<all_urls>'],  types: ['object','image','main_frame','sub_frame','xmlhttprequest','other'] });
}
