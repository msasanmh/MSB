/**
 * COPYRIGHT NOTICE
 All content included on this site, such as text, graphics, logos, buttons, icons, images, audio clips,
 and software is the property of Slawek Kaczorowski or its content supplier and protected by international copyright laws.
 The compilation (meaning the collection, arrangement, and assembly) of all content on this extension is the exclusive property of Slawek Kaczorowski
 and protected by international copyright laws. All software used on this site is the property of Slawek Kaczorowski
 or its software suppliers and protected by international copyright laws.
 The content and software on this site may be used as an online resource.
 Any other use, including the reproduction, modification, distribution, transmission, republication, or display of the content on this site is strictly prohibited.

 USE OF SITE
 This site or any portion of this site may not be reproduced, duplicated, copied, sold, resold, or otherwise exploited for any purpose that is not expressly
 permitted by Slawek Kaczorowski. Slawek Kaczorowski  and its affiliates reserve the right to refuse service,
 terminate accounts, and/or cancel orders in its discretion, including, without limitation, if Slawek Kaczorowski
 believes that customer conduct violates applicable law or is harmful to the interests of Slawek Kaczorowski  and its affiliates.
 */
(function () {
  Raven.config('https://508b16b2b1734e5c8f583091dca8be36@app.getsentry.com/27640').install();
  try {
    var tabId;
    var contextId;
    var sendMessageToPlayer = function (tabsParams,request) {
      chrome.tabs.query(tabsParams, function (tabs) {
        tabs.forEach(function (tab) {
          chrome.tabs.sendMessage(tab.id, request);
        });
      });
    };
    var getInfoTimeout = null;
    var getTrackInfo = function () {
      clearTimeout(getInfoTimeout);
      chrome.tabs.sendMessage(tabId, 'getTrackInfo', updateIcons);
      getInfoTimeout = setTimeout(getTrackInfo, 1000);
    };
    var title = {title: "Play SoundCloud"};
    var updateIcons = function (request, sendResponse) {
      try {
        if(typeof request !== 'undefined' && request.type) {
            switch (request.type) {
                case "isPlaying":
                    _gaq.push(['_trackEvent', 'Music', 'Play', 'Playing']);
                    chrome.browserAction.setIcon({
                        path: "../../icons/pause19.png"
                    });
                    sendMessageToPlayer({}, request);
                    chrome.tabs.sendMessage(tabId, 'getTrackInfo', updateIcons);
                    title.title = "Pause SoundCloud";
                    break;
                case "isPaused":
                    _gaq.push(['_trackEvent', 'Music', 'Play', 'Pausing']);
                    chrome.browserAction.setIcon({
                        path: "../../icons/play19.png"
                    });
                    clearTimeout(getInfoTimeout);
                    title.title = "Play SoundCloud";
                    sendMessageToPlayer({}, request);
                    break;
                case "playerPositionChange":
                    sendMessageToPlayer({}, request);
                    break;
                case "trackInfo":
                    sendMessageToPlayer({active: true}, request);
                    break;
                case "getTrackInfo":
                    if (tabId)
                        getTrackInfo();
                    break;
                case "stopGettingTrackInfo":
                    clearTimeout(getInfoTimeout);
                    break;
                case "playerPlay":
                    browserActionFire();
                    break;
                case "playerNext":
                    browserActionFire('next');
                    break;
                case "playerPrev":
                    browserActionFire('prev');
                    break;
                case "track":
                    _gaq.push(['_trackEvent', request.msg.category, request.msg.action, request.msg.label]);
                    break;
                case "isActive":
                    sendResponse({active: localStorage.getItem('player'), playerPosition: localStorage.getItem('playerPosition')});
                    break;

            }
        }
        chrome.browserAction.setTitle(title);
        chrome.contextMenus.update(contextId, title);
      } catch (e) {
        Raven.captureException(e)

      }
    };
    var clickButton = function (type) {
      if (type && (type === 'next' || type === 'prev')) {
        chrome.tabs.sendMessage(tabId, type, updateIcons);
      }
      else {
        chrome.tabs.sendMessage(tabId, 'clicked', updateIcons);
      }
    };
    chrome.runtime.onMessage.addListener(
      function (request, sender, sendResponse) {
        updateIcons(request, sendResponse);
        if (request.type == 'isPlaying' || request.type == 'isPaused') {
          tabId = sender.tab.id;
        } else if (request.type == 'error') {
          Raven.captureException(JSON.stringify(request.msg))
        } else if (request.type == 'noPlayerPosition'){
            localStorage.setItem('playerPosition', 'right-top');
        }
      });
    var browserActionFire = function (type) {
      var title = {title: "Play SoundCloud"};
      var createCallback = function (tab) {
        _gaq.push(['_trackEvent', 'Created', 'Created Soundcloud Tab']);
        tabId = tab.id;
        var loaded = function (tabId, info) {
          if (info.status == "complete") {
            clickButton(type);
            chrome.tabs.onUpdated.removeListener(loaded);
          }
        };
        chrome.tabs.onUpdated.addListener(loaded);
      };

      var findExistingTab = function () {
        chrome.tabs.query({url: "*://soundcloud.com/*"}, function (tabs) {
          var activeTabs = [],
            promisesArray = [];
          tabs.forEach(function (tab) {
            promisesArray.push(new Promise(function (resolve, reject) {
              chrome.tabs.sendMessage(tab.id, 'testConnection', function (resp) {
                if (resp) {
                  activeTabs.push(tab);
                }
                resolve();
              });
            }));
          });
          Promise.all(promisesArray).then(function () {
            if (activeTabs.length) {
              tabId = activeTabs[0].id;
              clickButton(type);
            } else if(tabs.length){
                chrome.tabs.executeScript(tabs[0].id, {file:'src/inject/inject.js'}, function(){
                    tabId = tabs[0].id;
                    clickButton();
                });
            } else {
              chrome.tabs.create({
                url: "https://soundcloud.com"
              }, createCallback);
            }
          })

        })
      };
      if (tabId) {
        try {
          chrome.tabs.get(tabId, function (tab) {
            // check if tab still exist
            if (tab) {
              clickButton(type);
            }
            else {
              chrome.browserAction.setIcon({
                path: "../../icons/play19.png"
              });
              chrome.browserAction.setTitle({title: "Play SoundCloud"});
              chrome.contextMenus.update(contextId, title);
              findExistingTab();
            }
          });
        } catch (err) {
          findExistingTab();
        }
      } else {
        findExistingTab();
      }
    };
    chrome.browserAction.onClicked.addListener(browserActionFire);
    contextId = chrome.contextMenus.create({title: "Play SoundCloud", onclick: clickButton});
    chrome.commands.onCommand.addListener(browserActionFire);
    chrome.runtime.onInstalled.addListener(function () {
      var player = localStorage.getItem('player');
      var playerPosition = localStorage.getItem('playerPosition');
      var toolbar = localStorage.getItem('toolbar');
      if (!player)
        localStorage.setItem('player', 'on');
      if (!playerPosition)
        localStorage.setItem('playerPosition', 'right-top');
      if (!toolbar)
        localStorage.setItem('toolbar', 'on');
    });
      _gaq.push(['_trackEvent', 'version', chrome.runtime.getManifest().version, 'version']);

  } catch (e) {
    Raven.captureException(JSON.stringify(e));
  }
})();