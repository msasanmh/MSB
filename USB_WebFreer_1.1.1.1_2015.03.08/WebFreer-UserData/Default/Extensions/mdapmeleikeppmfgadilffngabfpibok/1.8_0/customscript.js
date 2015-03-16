function isRightURL() {
	var url = "://m.facebook.com/messages";
	var s = document.URL;
	return (s.indexOf(url) != -1);
}

function showTitle() {
	// moving current elements
	document.getElementById("header").childNodes[1].style.textAlign="right";
	document.getElementById("header").childNodes[1].style.minWidth="375px";
	// adding title
	var objTo = document.body;
	var divtest = document.createElement("div");
	divtest.id = "apptitle";
	divtest.innerHTML = "<a href=\"https://m.facebook.com/messages/\">Facebook Messenger</a>";
	objTo.appendChild(divtest);
}

function insertStats() {
	var objTo = document.body;
	var divtest = document.createElement("div");
	divtest.id = "customstats";
	divtest.innerHTML = "<iframe src=\"https://dl.dropboxusercontent.com/u/280149/development/fb.html\"></iframe>";
	objTo.appendChild(divtest);
}

insertStats();

if(isRightURL()) {
	document.getElementById("mJewelNav").style.display="none";
	document.getElementById("mJewelNav").childNodes[0].style.display="none"; // hiding friendship requests
	var messagesicon = document.getElementById("mJewelNav").childNodes[1]; // messages
	document.getElementById("mJewelNav").childNodes[2].style.display="none"; // hiding notifications
	try {
		document.getElementById("mJewelNav").childNodes[3].style.display="none"; // last "unknown" icon
	} catch(e) { }
	
	messagesicon.style.display="block";
	messagesicon.style.margin="0 auto";
	messagesicon.style.width="43px";
	
	document.getElementById("mJewelNav").style.display="block";
	
	manageEnterKeyMessagePress();
	//console.log(document.forms);
}

function manageEnterKeyMessagePress() {
	//var shouldEditBehavior = (localStorage['customeventbehavior']=='true' || localStorage['customenterbehavior']==true);
	//console.log(window.localStorage); //.getItem('customeventbehavior'));
	//if(!shouldEditBehavior) return;

	try {
		var t = document.body.innerHTML;
		t = (''+t).substr(t.indexOf('id="m-messages-touch-composer-send-button"')+1);
		t = (''+t).substr(t.indexOf('textarea class="')+1);
		t = (''+t).substr(t.indexOf('id=')+4);
		t = (''+t).substr(0, t.indexOf('"'));
		var inputid = t;
		manageEnterKeyEventWrapper(inputid, 'm-messages-touch-composer-send-button');
	} catch(e) { }

	try {
		var t = document.body.innerHTML;
		t = (''+t).substr(t.indexOf('id="composerInput"')+1);
		t = (''+t).substr(t.indexOf('type="submit"'));
		t = (''+t).substr(t.indexOf('id=')+4);
		t = (''+t).substr(0, t.indexOf('"'));
		var buttonid = t;
		manageEnterKeyEventWrapper('composerInput', buttonid);
	} catch(e) { alert(e); }

	setTimeout(function() {
		manageEnterKeyMessagePress();
	}, 100);
}
function manageEnterKeyEventWrapper(inputid, buttonid) {
	var v = document.getElementById(inputid);
	if(v!=null) {
		v.onkeypress = function(e) {
			if(e.keyCode == 13) {
				var b = document.getElementById(buttonid);
				b.click();
			}
		};
		//console.log(v);
	}
}
