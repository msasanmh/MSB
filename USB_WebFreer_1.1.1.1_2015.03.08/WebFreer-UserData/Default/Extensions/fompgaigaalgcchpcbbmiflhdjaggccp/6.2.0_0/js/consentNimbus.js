chrome.extension.sendRequest({'operation': 'onTab', 'parameter': window.nimbusChromeOption});
chrome.extension.sendRequest({'operation': 'Crop', 'parameter': window.thisCrop});
chrome.extension.sendRequest({'operation': 'Er', 'parameter': window.thisEr});
chrome.extension.sendRequest({'operation': 'Scroll', 'parameter': window.thisScrollEr});