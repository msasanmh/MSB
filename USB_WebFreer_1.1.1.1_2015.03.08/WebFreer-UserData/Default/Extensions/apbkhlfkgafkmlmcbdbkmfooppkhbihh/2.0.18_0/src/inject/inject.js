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
  try {
    var playButton = document.querySelector('.playControl');
    var trackInfoElement = document.querySelector('.playbackTitle__link');
    var progressBar = document.querySelector('.progressBar__bar');
    var prevButton = document.querySelector('.skipControl__previous');
    var nextButton = document.querySelector('.skipControl__next');
    chrome.runtime.onMessage.addListener(
      function (request, sender, sendResponse) {

        if (request == "clicked") {
          play();
        } else if (request == 'testConnection') {
          sendResponse(true);
        } else if (request == 'getTrackInfo') {
          getTrackInfo();
        } else if (request == 'next') {
          if (!nextButton)
            nextButton = document.querySelector('.skipControl__next')
          nextButton.click();
        } else if (request == 'prev') {
          if (!prevButton)
            prevButton = document.querySelector('.skipControl__previous');
          if (!prevButton.classList.contains('disabled')) {
            prevButton.click();
          }
        }
      });
    var play = function () {
      try {
        playButton.click();
      } catch (error) {
        setObserver(true);
      }
    }
    var getTrackInfo = function () {
      var procentage = false;
      if (!trackInfoElement)
        trackInfoElement = document.querySelector('.playbackTitle__link');
      if (!playButton)
        playButton = document.querySelector('.playControl');
      if (!prevButton)
        prevButton = document.querySelector('.skipControl__previous');
      progressBar = document.querySelector('.playControls__wrapper .playbackTitle__progressBar');
      if (progressBar) {
        procentage = ((progressBar.style.width.replace('px', '') / progressBar.parentNode.offsetWidth) * 100);
      }
      try {
        chrome.runtime.sendMessage({
          type: 'trackInfo',
          msg: {
            procentage: procentage,
            trackTitle: trackInfoElement && trackInfoElement.textContent || '',
            trackUrl: trackInfoElement && trackInfoElement.href || '',
            isPlaying: playButton.classList.contains('playing'),
            prevDisabled: prevButton.classList.contains('disabled')
          }
        });
      } catch (e) {
          chrome.runtime.sendMessage({
              type: 'error',
              msg: e
          });
      }
    };
    var setObserver = function (play) {
      try {
        playButton = document.querySelector('.playControl');
        var playButtonObserver = new MutationObserver(function (mutations) {
          mutations.forEach(function (mutation) {
            if (mutation.attributeName === 'class') {
              if (mutation.target.classList.contains('playing')) {
                chrome.runtime.sendMessage({
                  type: 'isPlaying'
                });
              } else {
                chrome.runtime.sendMessage({
                  type: 'isPaused'
                });
              }
            }
          });
        });
        var playButtonConfig = { attributes: true};
        playButtonObserver.observe(playButton, playButtonConfig);
        if (play)
          playButton.click();
      } catch (err) {
//        chrome.runtime.sendMessage({
//          type: 'error',
//          msg: err
//        });
        setTimeout(setObserver.bind(this, play), 200);
      }
    };
    setObserver();
  }
  catch (e) {
    chrome.runtime.sendMessage({
      type: 'error',
      msg: e
    });
  }
})();
