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
  var player = localStorage.getItem('player'),
    playerPosition = localStorage.getItem('playerPosition') || 'right-top',
    playerCheckbox = document.querySelector('.player'),
    playerPositionSelect = document.querySelector('.player-position');
  if(playerPosition)
    playerPositionSelect.querySelector('option[value="'+playerPosition+'"]').selected = true;
  playerCheckbox.checked = player == 'on' ? true : false;
  playerCheckbox.addEventListener('change', function () {
    localStorage.setItem('player', this.checked ? 'on' : 'off');
  });
  playerPositionSelect.addEventListener('change', function () {
    localStorage.setItem('playerPosition', this.value);
    chrome.runtime.sendMessage({type:'playerPositionChange', msg: this.value});
  });
})();