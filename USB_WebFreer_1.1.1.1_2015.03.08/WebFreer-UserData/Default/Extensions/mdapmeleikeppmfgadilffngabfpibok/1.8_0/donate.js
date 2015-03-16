function showRightMessage() {
  var mustshowpromotion = false;
  if(localStorage['facebookmobileview']=='NaN') mustshowpromotion = true;
  if(localStorage['facebookmobileview']!='true') mustshowpromotion = true;
  if(mustshowpromotion) {
    document.getElementById('realcontent').style.display='none';
    document.getElementById('promotion').style.display='block';
    localStorage.setItem('facebookmobileview', true);
  }
}

setTimeout(function() { showRightMessage(); }, 100);