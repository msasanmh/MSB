function toBool(str) {
	if ("false" === str) {
		return false;
	} else if ("true" === str) {
		return true;
	} else {
		return str;
	}
}
function initCheckbox(option, defaultValue) {
	var value = localStorage[option];
	if (defaultValue == undefined) {
		defaultValue = false;
	}
	value = value == null ? defaultValue : value;
	// Because periods in the ID fields cannot read by jQuery/$ so i used old style DOM call here :)
	var node = document.getElementById(option);
	$(node).attr("checked", toBool(value));
}

$(function() {
	initCheckbox("toplinks.reader", true);
	initCheckbox("toplinks.web", true);
	initCheckbox("toplinks.more", true);
	initCheckbox("searchButtons", true);
	initCheckbox("help", true);

	initCheckbox("spamCount", true);
	initCheckbox("moreLabels", true);
	initCheckbox("chat", true);
	initCheckbox("invites", true);

	initCheckbox("actionButtons", true);
	initCheckbox("selectAll", true);

	initCheckbox("messageViewLabels", true);
	initCheckbox("messagesDragDrop", true);
	initCheckbox("checkBoxes", true);
	initCheckbox("stars", true);
	initCheckbox("currentEmailIndicator", true);
	initCheckbox("emailHighlighting", true);

	initCheckbox("gmail.actionLinks", true);
	initCheckbox("gmail.sidebarLinks", false);
	initCheckbox("gmail.actionLinks.iconsOnly", false);
	initCheckbox("ads", true);
	initCheckbox("adsGoogleApps", true);

	initCheckbox("tips", true);
	initCheckbox("currentlyUsing", true);
	initCheckbox("accountActivity", true);
	initCheckbox("gmailview", true);
	initCheckbox("copyright", true);

	initCheckbox("donateLink", true);

	initCheckbox("hotmail.ads", false);

	initCheckbox("yahoo.ads", false);

	$("#webClips").click(function(e) {
		alert("This can be disabled within your Gmail 'Settings' under the 'Web Clips' tab!");
		return false;
	});

	$("input[type=checkbox]").not("#donateLink").change( function(e) {
		console.log(e);
		var id = $(this).attr("id");
		if (id != "webClipsInput") {
			localStorage[id] = $(this).prop("checked");
			$("#refresh").fadeIn();		
		}
	});
	
});