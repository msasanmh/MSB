var sleepTimeout = 60;

var currentVersion = 1;

var notificationTimeout = 5000;

function mustSkipDonate() {
  var limit = 10;
  try {
    if(localStorage['skipcount']=='NaN') localStorage.setItem('skipcount', 1);
    var v = eval('('+localStorage['skipcount']+')');
    if(v==null) { localStorage.setItem('skipcount', ''+1); v = 1; }
    if(localStorage['skipcount']=='NaN');
    if(v >= limit) {
      localStorage.setItem('skipcount', ''+1);
      return false;
    }
    v++;
    localStorage.setItem('skipcount', ''+v);
    return true;
  }
  catch(e) {
    localStorage.setItem('skipcount', ''+1);
    return false;
  }
  return false;
}

function load() {
  chrome.browserAction.onClicked.addListener(function(tab) {
    openFBPopup();
  });
  checkNotifications();
}

function openFBPopup() {
  try {
    chrome.windows.remove(eval('('+localStorage['id']+')'), function() { });
  }
  catch(e) { }

  chrome.windows.getCurrent(function(w) {
    var url = 'changelog.html';
    if(localStorage['changelog']!=currentVersion) {
      localStorage['changelog'] = currentVersion;
    }
    else {
      url = 'donate.html';
      //console.log(eval('('+localStorage['isprouser']+')'));
      var skipDonate = mustSkipDonate();
      if ((skipDonate) || (eval('('+localStorage['isprouser']+')') == true))
        url = 'http://m.facebook.com/messages';
        //url = 'redirect.html';
    }

    var windowW = 400;
    var windowH = 600;
    var x = chrome.windows.create({'url': url, 'type': 'panel', 'focused': true,
      'width': windowW, 'height': windowH, 'top': (w.height-windowH), 'left': (w.width-windowW)},
      function(win) {
        localStorage['id'] = win.id;
      }
    );
  });
}

// Thanks to: http://goo.gl/NoZ9yI
function checkNotifications() {
  var xhr=new XMLHttpRequest();
  xhr.open('GET','https://www.facebook.com/home.php',true);
  xhr.onreadystatechange=function(){
    if(xhr.readyState==4){
      var xmlDoc=xhr.responseText;

      if(xmlDoc.indexOf('notificationsCountValue') > 0){
        loc=xmlDoc.indexOf('messagesCountValue');
        if(loc>0){
          var myString=xmlDoc.substr(loc, 80);
          var c = parseInt(myString.substring(myString.indexOf('>')+1,myString.indexOf('<')));
          updateIcon(c);
        }
      }
    }
    else return;
  }
  xhr.send(null);
  //window.clearTimeout(timerVar);
  //timerVar=window.setTimeout(loadData,timerDelay);
  setTimeout(function() {
    checkNotifications();
  }, sleepTimeout*1000);
}

function autoclosenotification(n) {
  try {
    setTimeout(function() { n.close(); }, notificationTimeout);
  }
  catch(e) { }
}

function showDesktopNotification(n) {
  var havePermission = window.webkitNotifications.checkPermission();
  if (havePermission == 0) { // 0 is PERMISSION_ALLOWED
    var notification = window.webkitNotifications.createNotification(
      './img/icon_128.png',
      'Facebook Messenger',
      'You have '+n+' unread Facebook messages'
    );

    notification.onclick = function () {
      //window.open("https://www.facebook.com/messages/");
      openFBPopup();
      notification.close();
    }
    notification.show();
    autoclosenotification(notification);
  } else {
      window.webkitNotifications.requestPermission();
  }
}

function updateIcon(n) {
  var t;
  if(n<=0) t = '';
  else if(n>10) t = '10+';
    else t = ''+n;
  chrome.browserAction.setBadgeText({text: t}); 
  chrome.storage.sync.set({'fbmsgcounter': n}, function() { /* notify that we saved, if needed */ });
}
chrome.browserAction.setBadgeText({text: ''});

function areDesktopNotificationsEnabled() {
  var v = localStorage['options_dn'];
  if(v==undefined || v==true || v=='true') return true;
  return false;
}

if(areDesktopNotificationsEnabled()) {
  // counter value listener
  chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (key in changes) {
      var storageChange = changes[key];
      if(key=='fbmsgcounter') {
        var oldvalue = storageChange.oldValue;
        var newvalue = storageChange.newValue;
        if(newvalue>oldvalue) showDesktopNotification(newvalue);
      }
      console.log('Storage key "%s" in namespace "%s" changed. ' + 'Old value was "%s", new value is "%s".', key, namespace, storageChange.oldValue, storageChange.newValue);
    }
  });
}

load();
