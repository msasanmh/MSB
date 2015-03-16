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
    var init = function (playerPosition) {
      chrome.runtime.sendMessage({type: 'track', msg: {
        category: 'Player',
        action: 'init',
        label: 'inited'
      }});
      chrome.runtime.sendMessage({type: 'track', msg: {
        category: 'Player',
        action: 'playerPosition',
        label: playerPosition
      }});
      var player = [
        '<player-div id="sc-player" class="'+playerPosition+'">',
        '<player-tag class="player-tag">',
        '<a target="_blank" href="https://soundcloud.com"></a>',
        '</player-tag>',
        '<player-wrapper class="player-wrapper">',
        '<player-button class="player-prev disabled"></player-button>',
        '<player-button class="player-play"></player-button>',
        '<player-button class="player-next"></player-button>',
        '<player-info class="player-info"><a href="#"></a></player-info>',
        '<player-state class="player-state-wrapper">',
        '<player-div class="player-state-progress"></player-div>',
        '</player-state>',
        '</player-wrapper>',
        '</player-div>'].join('\n');
      var div = document.createElement('div');
      div.innerHTML = player;
      document.body.appendChild(div.children[0]);

      var playerContainer = document.querySelector('player-div#sc-player'),
        playerWrapper = document.querySelector('.player-wrapper'),
        playButton = playerContainer.querySelector('.player-play'),
        nextButton = playerContainer.querySelector('.player-next'),
        prevButton = playerContainer.querySelector('.player-prev'),
        playerStateProgress = playerContainer.querySelector('.player-state-progress'),
        playerInfo = playerContainer.querySelector('.player-info'),
        currentPlayingTrack = {title: '', url: ''};

      var changeTrack = function (trackTitle, trackUrl) {
        chrome.runtime.sendMessage({type: 'track', msg: {
          category: 'Player',
          action: 'changeTrack',
          label: 'changeTrack'
        }});
        if (currentPlayingTrack.title !== trackTitle) {
          playerInfo.classList.remove('disappear');
          playerInfo.classList.remove('appear');
          currentPlayingTrack = {title: trackTitle, url: trackUrl};
          playerInfo.classList.add('disappear');
        }
      };
      var changePlayerPosition = function(newPosition){
          playerContainer.className = newPosition;
      };
      chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
          switch (request.type) {
            case "trackInfo":
              if (request.msg.procentage) {
                playerStateProgress.style.width = request.msg.procentage + "%";
                playerStateProgress.style.display = 'block';
              }
              else
                playerStateProgress.style.display = 'none';
              if (request.msg.trackTitle) {
                changeTrack(request.msg.trackTitle, request.msg.trackUrl);
              }
              if (request.msg.isPlaying)
                playButton.classList.add('playing');
              else
                playButton.classList.remove('playing');
              if (request.msg.prevDisabled)
                prevButton.classList.add('disabled-prev');
              else
                prevButton.classList.remove('disabled-prev');
              break;
            case "playerPositionChange":
              changePlayerPosition(request.msg);
              break;
            case "isPlaying":
              playButton.classList.add('playing');
              break;
            case "isPaused":
              playButton.classList.remove('playing');
              break;
          }
        });
      playerInfo.addEventListener('webkitAnimationEnd', function (ev) {
        switch (ev.animationName) {
          case 'disappear':
            playerInfo.classList.remove('disappear');
            playerInfo.innerHTML = '<a target="_blank" href="' + currentPlayingTrack.url + '">' + currentPlayingTrack.title.substring(0,15) + '</a>';
            break;
          case 'appear':
            playerInfo.classList.remove('appear');
            break;
        }
        playerInfo.classList.add('appear');
      });
      playerContainer.addEventListener('mouseenter', function (e) {
        try {

            chrome.runtime.sendMessage({type: 'track', msg: {
                category: 'Player',
                action: 'mouseEnter',
                label: 'mouseEnter'
            }});
            playerInfo.classList.add('appear');
            chrome.runtime.sendMessage({type: 'getTrackInfo'});
        } catch(e) {
            if(e.message && e.message.indexOf('Error connecting to extension') !== -1) {
                playerWrapper.innerHTML = '<player-error>Ups look like we have problem with your player! Please reload this page to fix it.</player-error>';
            }
        }
      }, false);
      playerContainer.addEventListener('mouseleave', function (e) {
        chrome.runtime.sendMessage({type: 'track', msg: {
          category: 'Player',
          action: 'mouseLeave',
          label: 'mouseLeave'
        }});
        chrome.runtime.sendMessage({type: 'stopGettingTrackInfo'});
      }, false);
      playButton.addEventListener('click', function (e) {
        chrome.runtime.sendMessage({type: 'track', msg: {
          category: 'Player',
          action: 'Button',
          label: 'Play'
        }});
        chrome.runtime.sendMessage({type: 'playerPlay'});
        chrome.runtime.sendMessage({type: 'getTrackInfo'});
      });
      nextButton.addEventListener('click', function (e) {
        chrome.runtime.sendMessage({type: 'track', msg: {
          category: 'Player',
          action: 'Button',
          label: 'Next'
        }});
        chrome.runtime.sendMessage({type: 'playerNext'});
        playerInfo.querySelector('a').classList.add('changing');
      });
      prevButton.addEventListener('click', function (e) {
        chrome.runtime.sendMessage({type: 'track', msg: {
          category: 'Player',
          action: 'Button',
          label: 'Prev'
        }});
        chrome.runtime.sendMessage({type: 'playerPrev'});
        playerInfo.querySelector('a').classList.add('changing');
      });
    };
    chrome.runtime.sendMessage({type: 'isActive'}, function (playerParams) {
      try {
        if (playerParams && playerParams.active === 'on') {
          if(!playerParams.playerPosition) {
            chrome.runtime.sendMessage({
              type: 'error',
              msg: 'no player position'
            });
            chrome.runtime.sendMessage({type: 'noPlayerPosition'});
            init('right-top');
          } else {
            init(playerParams.playerPosition);
          }
        } else {
          chrome.runtime.sendMessage({type: 'track', msg: {
            category: 'Player',
            action: 'Disabled',
            label: 'True'
          }});
        }
      } catch (e) {
        chrome.runtime.sendMessage({
          type: 'error',
          msg: e
        });
      }
    })
  } catch (e) {
    chrome.runtime.sendMessage({
      type: 'error',
      msg: e
    });
  }
})();
