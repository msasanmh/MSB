function addListener(element, eventName, handler) {
  if (element.addEventListener) {
    element.addEventListener(eventName, handler, false);
  }
  else if (element.attachEvent) {
    element.attachEvent('on' + eventName, handler);
  }
  else {
    element['on' + eventName] = handler;
  }
}

function registerproversion() {
  // ok, this code is not so stealthy...
  // there's a lot of work behind this extension, so I hope you to be fair...
  // if not, enjoy anyway... and happy hacking!! ;-)
  var needle = 47390;
  var today = new Date();
  var m = today.getMonth()+1;
  var y = today.getFullYear();
  var r = needle+y*3+m*6;
  var v = document.getElementById('procode').value;
  if(v==r) {
      alert("Thanks for your support. It's really appreciated.");
      localStorage['isprouser'] = true;
      document.getElementById('proversion').style.display='none';
  }
  else {
    alert('Check your code or contact us at enrico.cambiaso[at]gmail.com');
  }
}

function changeDNSetting() {
  var storedvalue = !(localStorage['options_dn']=='false' || localStorage['options_dn']==false);
  storedvalue = !storedvalue;
  localStorage['options_dn'] = storedvalue;
  alert('Desktop notifications are now '+(storedvalue ? 'enabled' : 'disabled'))+'!';
  setDNSetting();
}

function changeCustomEnterBehaviorSetting() {
  var storedvalue = !(localStorage['customeventbehavior']=='false' || localStorage['customeventbehavior']==false);
  storedvalue = !storedvalue;
  localStorage['customeventbehavior'] = storedvalue;
  alert('Fast Messages Sending is now '+(storedvalue ? 'enabled' : 'disabled'))+'!';
  setCustomEnterBehaviorSetting();
}

function setDNSetting() {
  var status = document.getElementById('dnstatus');
  var change = document.getElementById('dnchange');
  var storedvalue = !(localStorage['options_dn']=='false' || localStorage['options_dn']==false);
  status.innerHTML = 'Desktop notification are '+(storedvalue ? 'enabled' : 'disabled')+'!';
  change.innerHTML = '<a href="#" id="changednsetting">Click to '+(storedvalue ? 'disable' : 'enable')+' them</a>';
  addListener(document.getElementById('changednsetting'), 'click', function() { changeDNSetting(); return false; });
}

function setCustomEnterBehaviorSetting() {
  var divid = document.getElementById('customenterbehavior');
  var storedvalue = (localStorage['customeventbehavior']=='true' || localStorage['customeventbehavior']==true);
  divid.innerHTML = 'Fast Messages Sending with Enter key is '+(storedvalue ? 'enabled' : 'disabled')+'!';
  divid.innerHTML+= '<br/><a href="#" id="changecustomenterbehavior">Click to '+(storedvalue ? 'disable' : 'enable')+' it</a>';
  addListener(document.getElementById('changecustomenterbehavior'), 'click', function() { changeCustomEnterBehaviorSetting(); return false; });
}

function checkProVersion() {
  var v = localStorage['isprouser'];
  if(v==undefined || v!='true') {
    document.getElementById('proversion').style.display='block';
    addListener(document.getElementById('registerproversion'), 'click', function() { registerproversion(); return false; });
  }
}

function showAppVersion() {
  var manifest = chrome.runtime.getManifest();
  var version = manifest.version;
  document.getElementById('appversion').innerHTML='v. '+version;
}

setTimeout(function() {
  showAppVersion();
  setDNSetting();
  setCustomEnterBehaviorSetting();
  checkProVersion();
}, 100);
