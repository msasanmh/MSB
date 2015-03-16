/*
gmailadblocker
===========
change log
	-More option to hide things in Gmail (Labels etc.)
test
	-check reviews before pushing
	-other languages
	-preview pane
	-labs with rightside addons
	-offline/online
	-all options
	-chat/chat msg window
*/

(function(){
	var init = function() {
		if(!gmail) var gmail={};
		var ls = null;
		var email;
		var DONATE_LINK_NAME = "Webmail Ad Blocker";
		var DONATE_LINK_URL = ""; //chrome.extension.getURL('donate.html'); //"https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=W59HJD5VNL6W6";
		var DONATE_LINK_TOOLTIP = chrome.i18n.getMessage("pleaseDonate") + " " + chrome.i18n.getMessage("pleaseDonate2");
		var processingDOM = false;
		var yahooBetaToolbar = null;
		var detectMenuItemsAttempts = 0;
		var toBool = function(str) {
			if ("false" === str) {
				return false;
			} else if ("true" === str) {
				return true;
			} else {
				return str;
			}
		};
		function exists(o) {
			if (o) {
				return true;
			} else {
				return false;	
			}	
		}
		var getNode = function(doc, xpath) {
			var node = doc.evaluate(xpath, doc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
			if (node) {
				if (node.snapshotLength == 1) {
					return node.snapshotItem(0);
				} else if (node.snapshotLength >= 2) {
					console.warn("Ignored getNode() for \"" + xpath + "\" because it returned " + node.snapshotLength + " results");
				}
			}
		};
		var addStyle = function(css){
			var s = document.createElement('style');
			s.setAttribute('id', 'webmailAdBlocker');
			s.setAttribute('type', 'text/css');
			s.appendChild(document.createTextNode(css));
			return (document.getElementsByTagName('head')[0] || document.documentElement).appendChild(s);
		};
		var pref = function(key, defaultValue) {
			var value = ls[key];
			if (defaultValue == undefined) {
				defaultValue = false;
			}
			return value == null ? defaultValue : toBool(value);
		};
		var hideNode = function(xpath) {
			var obj = getNode(document, xpath);
			if (obj) {
				obj.style.display = 'none';
				return true;
			} else {
				return false;
			}
		};
		var addDonationClickedEvent = function(donationNode) {
			/*
			donationNode.addEventListener('click', function() {
				chrome.runtime.sendMessage({name: "setLocalStorage", key: "donationClicked", value: "true"}, function(response) {
					// don't need response
				});
			});
			*/
		};
		gmail = {
			displayDonateLink: function(doc) {
				if (pref("donateLink", true)) {
					// old top navigation
					var refNode = getNode(doc, "//div[@id='guser']");
					if (refNode) {
						var linkNameIdx = refNode.innerHTML.indexOf(DONATE_LINK_NAME);
						//var refNode = getNode(doc, "//div[@id='guser']//b[contains(text(), '@')]");						
						refNode = refNode.getElementsByTagName("span");
						if (refNode) {
							refNode = refNode[0];
						}
						if (refNode && linkNameIdx == -1) {
							var donationNode = doc.createElement('a');
							donationNode.setAttribute("target", "_blank");
							donationNode.setAttribute("href", DONATE_LINK_URL);
							donationNode.setAttribute("class", "e");
							donationNode.setAttribute("title", DONATE_LINK_TOOLTIP);
							var txt = doc.createTextNode(DONATE_LINK_NAME);
							donationNode.appendChild(txt);
							refNode.parentNode.insertBefore(donationNode, refNode);
							
							var sepNode = doc.createElement("span") 
							txt = doc.createTextNode(" | ");
							sepNode.appendChild(txt);
							refNode.parentNode.insertBefore(sepNode, refNode);
							addDonationClickedEvent(donationNode);
						}
					} else {
						// new top navigation
						topRight = doc.getElementById("gbz");
						if (topRight) {
							var linkNameIdx = topRight.innerHTML.indexOf(DONATE_LINK_NAME);
							//var refNode = getNode(doc, "//div[@id='guser']/nobr/child::node()[1]");
							if (linkNameIdx == -1) {
								//var donationLink = $("<li class='gbt'><a target='_blank' class='gbzt' onclick='' title=\"" + DONATE_LINK_TOOLTIP + "\" href='" + DONATE_LINK_URL + "'><span class='gbtb2'></span><span class='gbts'>" + DONATE_LINK_NAME + "</span></a></li>");
								//$("#gbz .gbt").last().before(donationLink);
								//addDonationClickedEvent(donationLink.get(0));
							}
						}
					}
				}
			},
			removeTopRightLink: function(doc, xpath) {
				var node = getNode(doc, xpath);
				if (node) {
					var sepNode = node.previousSibling;
					if (sepNode && sepNode.nodeValue && sepNode.nodeValue.indexOf("|") != -1) {
						//sepNode.parentNode.removeChild(sepNode);
					}
					sepNode = node.parentNode.previousSibling;
					if (sepNode && sepNode.nodeValue && sepNode.nodeValue.indexOf("|") != -1) {
						sepNode.parentNode.removeChild(sepNode);
					}
					node.parentNode.removeChild(node);
				}
			},
			detectMenuItems: function(e) {
				if (++detectMenuItemsAttempts > 20) {
					return;
				}
				console.log("calling detectmenuItems")
				//var leftLinks = getNode(document, "//a[contains(@href, '#inbox')]");
				if ($(".nH.nn").length != 0) {
				//if (leftLinks) {
					//gmail.displayDonateLink(document);
					if (pref("toplinks.reader", true) == false) {
						hideNode("//div[@id='gbar']//a[contains(@href, '/reader/')]");
					}
					if (pref("toplinks.web", true) == false) {
						hideNode("//div[@id='gbar']//a[contains(@href, '/webhp')]");
					}
					if (pref("toplinks.more", true) == false) {
						hideNode("//div[@id='gbar']//u[contains(text(), 'more')]//parent::a");
					}
					if (pref("help", true) == false) {
						gmail.removeTopRightLink(document, "//div[@id='guser']//a[contains(@href, '/support')]");
						gmail.removeTopRightLink(document, "//div[@id='guser']//span[contains(@id, ':r4')]");
						//preceding-sibling::chapter[position()=1]
						gmail.removeTopRightLink(document, "//div[@id='guser']//span[contains(text(), 'Help')]");
					}
					if (pref("spamCount", true) == false) {
						var obj = getNode(document, "//a[contains(@href, '#spam')]");
						if (obj) {
							obj.innerHTML = "Spam";
							obj.style.cssText += ";font-weight:normal !important";
						}
					}
					if (pref("moreLabels", true) == false) {
						$(".n6").hide();
						//hideNode("//span[contains(@class, 'CJ')]//ancestor::div[1]");
					}

				} else {
					setTimeout(function () { gmail.detectMenuItems(); }, 1000);
				}
			}
		}	
		if(document.documentElement instanceof HTMLHtmlElement) {
			chrome.runtime.sendMessage({name: "getLocalStorage"},
				 function(response) {
					ls = response.ls;
					var addCSS = false;
					var css = "@namespace url(http://www.w3.org/1999/xhtml); ";
					var webmailName;

					if (document.location.href.match("mail.google.")) {
						addCSS = true;
						webmailName = "gmail";

						// CHANGED to really mean whole right side
						if (pref("ads", true) == false) {
							// Old version
							css += " #fi #fic {margin-right:100px !important} ";
							css += " #fi #rh {margin-left:-115px !important;width:95px !important} ";
							css += " #fi .rh {display:none !important} ";

							// Use for keeping right area visible for moving elements out of if using absolute like the Maps or Calendar events
							//css += " .iY .Bu:last-child > .nH {height: 0px !important;overflow: hidden !important;width: 1px !important} "; /* Ads Area - Jason: change from 0px to 1px cause right area was moving after loading */
							
							/*
							$(document).ready(function() {
								alert("abc: " + $("body:not(.xE)").length)
								alert("def: " + $("body:not(.xE) .Bs .Bu").length)
								alert("ghi: " + $("body:not(.xE) .Bs .Bu:last-child").length)
								//$("body:not(.xE) .Bs .Bu:last-child").css("background", "yellow");
							});
							*/
							//chrome.runtime.sendMessage({name:"insertCSS", css:"  body:not(.xE) .Bs .Bu:last-child .nH[style*=\"width\"] {display: none !important} "});
							//css += " body:not(.xE) .m .Bs .Bu:not(:first-child) {display: none !important} "; /* .m is because the .bu happen above if right side chat is enabled. Completeling remove last bu and .xiu1Fc is used for excluding popout view it's the class of the <html> tag */
							css += " body:not(.xE) div[role='main'] .Bu:not(:first-child) {display: none !important} "; /* Using div[role='main'] because i found out that .Bs and .Bu was used higher up in the node atleast with right side chat etc. */
							
							//css += " .iY .Bu:first-child + .Bu {display: none !important} "; /* Separator column */
							//css += " .iY {width: 100% !important} "; /* Message area */
						}
							
						// Hide ad below people widget
						css += " .Bs .Bu:last-child .oM {display:none !important} "; /* ads*/
						css += " .Bs .Bu:last-child .u8 {display:none !important} "; /* about these links */

						// hover ad when scrolling down
						css += " .AT {display:none !important} ";

						// ad above message area
						css += " .mq {display:none !important} ";

						// Ad below email content (refer to ghazel@gmail.com for html or Mike Tirakis has reported it to me, a bit suspicious)
						css += " .z0DeRc {display:none !important} ";
						// another ad below by Christian Szita
						css += " .nH.hx .nH.PS {display:none !important} ";

						// Ad below email content (refer to ghazel@gmail.com for html or Mike Tirakis has reported it to me, a bit suspicious)
						css += " iframe[src*='http://pagead2.googlesyndication.com'] {display:none !important} ";

						if (pref("emailHighlighting", true) == true) {
							var normalViewPrefix = " .qRauBc:not(.Zheyfb) "; //.Zheyfb is present in vertical view
							var horizontalViewPrefix = " .nH.NUxIad.wV0Tif.KJpZkd:not(.nn) ";							
							var hoverCSS1 = " .zA.yO:hover {background: rgb(255,235,134) none repeat scroll 0 0 !important} ";
							var hoverCSS2 = " .zA.zE:hover {background: rgb(205,243,159) none repeat scroll 0 0 !important} ";
							
							css += normalViewPrefix + hoverCSS1;  
							css += normalViewPrefix + hoverCSS2;
							
							css += horizontalViewPrefix + hoverCSS1;
							css += horizontalViewPrefix + hoverCSS2;
						}
						if (pref("chat", true) == false) {
							css += " .pS.s {display:none} ";
						}
						if (pref("invites", true) == false) {
							css += " .pS.pY {display:none !important} ";
						}
						if (pref("selectAll", true) == false) {
							//css += " .D.A1 .yV, .D.AY .yV {display:none} ";
						}
						if (pref("messagesDragDrop", true) == false && pref("checkBoxes", true) == false) {
							css += ".Cp .Ci {width:8px !important} ";
							css += " td.oZ-x3 {background:none !important} ";
						} else if (pref("messagesDragDrop", true) == false) {						
							css += " td.oZ-x3 {background:none !important} ";
						} else if (pref("checkBoxes", true) == false) {
							css += ".Cp .Ci {width:14px !important} ";
						}
						if (pref("messageViewLabels", true) == false) {
							css += " .cf.hX {display:none} ";
						}
						if (pref("stars", true) == false) {
							css += " .y5 {width:0px !important} ";
							css += " .cf.zt .y4 {visibility:hidden;width:0px} ";
							css += " .lHQn1d {display:none} ";
						}
						if (pref("searchButtons", true) == false) {			
							// toggles between both, don't know why?
							//css += ".GcwpPb-uq0Mrf, .GcwpPb-txTtjf {display:none} ";
							//css += " .bN.bM, .bN.bR {display:none} ";
						}
						if (pref("actionButtons", true) == false) {
							//css += ".A1.D.E .Cq {display:none} "; // inbox view
							//css += " .Pl.J-J5-Ji {display:none !important} "; // message view
							//css += " .AP {display:none} "; // Refresh link
						}
						if (pref("currentEmailIndicator", true) == false) {
							css += " .oZ-jd {visibility:hidden !important} ";
						}
						if (pref("tips", true) == false) {
							css += " .nH.l2.ov .mn {display:none} ";
						}
						if (pref("currentlyUsing", true) == false) {
							css += " .nH.l2.ov .md {display:none} ";
						}
						/* CHANGED to mean whole footer now with new Gmail changes to the footer */
						if (pref("accountActivity", true) == false) {
							css += " .l2.ov.nH.oy8Mbf {display:none} ";
						}				
						if (pref("gmailview", true) == false) {
							css += " .nH.l2.ov .mp {display:none} ";
						}
						if (pref("copyright", true) == false) {
							css += " .nH.l2.ov .ma {display:none} ";
						}
						
						// Ad for Checker Plus for Gmail
						if (!ls["adForCheckerPlusForGmailShown"]) {
							chrome.runtime.sendMessage({name:"showNotification"});
						}
						
					}

					if (document.location.href.match("mail.live.")) {
						addCSS = true;
						webmailName = "hotmail";

						if (pref("hotmail.ads") == false) {
							css += " iframe[id='dapIfM0'], iframe[id='dapIfM1'], .c_ads_ad, div[name='Advertisement'] {display:none !important} "; /* most ads:including ad below folders */

							css += " .Managed .WithSkyscraper #MainContent {right:0 !important} "; // with preview pane (default)
							css += " .Unmanaged .WithSkyscraper #MainContent {margin-right:0 !important} ";	// no preview pane

							css += " .Managed .WithRightRail #MainContent {right:0 !important} "; // with preview pane (default)
							css += " .Unmanaged .WithRightRail #MainContent {margin-right:0 !important} ";	// no preview pane

							css += " #SkyscraperContent {display:none !important} ";
							css += " #RadAd_Skyscraper {display:none !important} ";
							
							// outlook.com
							css += " #ManagedContentWrapper {padding-right:0 !important} ";							
							css += " #RightRailContainer {display:none !important} ";
							
							// outlook.com version 2? refer to http://jasonsavard.com/forum/discussion/comment/1251#Comment_1251
							css += " .WithRightRail {right:0 !important} ";
						}

					}

					if (document.location.href.match("mail.yahoo.")) {
						addCSS = true;
						webmailName = "yahoo";
						
						if (pref("yahoo.ads") == false) {
							css += " *[class*='ad_slug'] {display:none !important} "; /* welcome page ad, empty inbox ad etc. */
							css += " div[id='MNW'] {display:none !important} "; /* Classic Yahoo:Ad above folder */
							css += " div[id='northbanner'] {display:none !important} "; /* Classic Yahoo:top banner */
							css += " iframe[src*='http://ad.'] {display:none !important} "; /* Classic Yahoo:top banner in calendar */

							// Beta version
							css += " #theAd {display:none !important} "; // right ad
							css += " #theMNWAd {display:none !important} "; // ad above inbox says... Sahil Best - sexy_sam28@ymail.com
							css += " #shellcontent {right:0 !important} "; // right ad							
							css += " #slot_LREC {display:none !important} "; // What's new landing page ad
							css += " #slot_REC {display:none !important} "; // left ad
							css += " #slot_MON {display:none !important} "; // Spam box ad
							css += " #toolbar {right:0 !important} "; // right ad (stretches the toolbar)
							css += " .messagepane .right-ar {right:0 !important} "; // right arrow - for at&t yahoo

							// yahoo started using display:block !important   so i had to find an alternative to hiding by shrinking the size of div layer
							css += " .mb-rec-ad {height:0 !important; border:none !important; overflow-x:hidden !important; display:none !important} "; // ad in left column
							css += " .mb-list-ad {height:0 !important; border:none !important; overflow-x:hidden !important; display:none !important} "; // ad just above inbox
							
							// Beta version (with page by page view option)
							css += " #main, #yucs, #yuhead-bucket {max-width:none !important} ";
							css += " .fullpage #main, .fullpage #yucs, .fullpage #yuhead-bucket {margin-right:0 !important} ";
							
							var foldersPane = document.getElementById("foldersPane");
							if (foldersPane) {
								var contentWidth = window.innerWidth - foldersPane.clientWidth - 10;
								css += " #welcomeAdsContainer {display:none !important} "; /* On Home tab (welcome screen of yahoo mail */
								css += " #mainTabView {width:" + contentWidth + "px !important} ";
								css += " #mainTablePane {width:100% !important} ";
								css += " .PagedTableView_container {width:100% !important} ";
								css += " div[id^='imcSession_'] {width:" + contentWidth + "px !important} "; /* Text/Chat message window */
								css += " #ym-skyhider {display:none !important} "; /* seperator for the right side area */
								css += " #largePane {display:none !important} "; /* Right side wrapper */
								css += " #largeFrame {display:none !important} "; /* Ad area */
								css += " #ym-skyscroller {display:none !important} "; /* Ad scrolling arrow */
							}

							/*
							if (false && !window.frameElement) {
								$("iframe").bind("load", function() {
									var rightSideTray = $("#rightSideTray");
									if (rightSideTray.length) {
										var foldersPane = $("#foldersPane");
										if (foldersPane.length) {
											if (rightSideTray.css("display") == "block") {
												var rightSideTrayWidth = rightSideTray.css("width").replace("px", "");
												var contentWidth = window.innerWidth - foldersPane.width() - rightSideTrayWidth - 25;
												$("#largePane").css("display", "block !important");
												$("#mainTabView").css("width", contentWidth + "px !important");
											} else {
												$("#largePane").css("display", "none !important");
												$("#mainTabView").css("width", "");
											}
										}
									}
									
									if (false && pref("donateLink", true)) {
										// Top right
										node = document.getElementById("tabBarLinks");
										if (node) {
											if (node.innerHTML.indexOf(DONATE_LINK_NAME) == -1) {
												node.innerHTML = "<a id='webmailadblocker' class='textLink' target='_blank' href='" + DONATE_LINK_URL + "' title='" + DONATE_LINK_TOOLTIP + "' hidefocus=''>" + DONATE_LINK_NAME + "</a><span class='miniSeparator'> | </span>" + node.innerHTML;
												addDonationClickedEvent(node);
											}
										}
										// Inbox view
										node = document.getElementById("mainToolbar");
										if (node) {
											if (node.innerHTML.indexOf(DONATE_LINK_NAME) == -1) {
												node.innerHTML += "<span title='" + DONATE_LINK_TOOLTIP + "' style='padding: 2px 10px 0px 15px'><a target='_blank' href='" + DONATE_LINK_URL + "'>" + DONATE_LINK_NAME + "</a></span>";
												addDonationClickedEvent(node);
											}
										}
										// In message view
										node = document.getElementById("widget_item_2");
										if (node) {
											if (node.innerHTML.indexOf(DONATE_LINK_NAME) == -1) {
												node.innerHTML += "<span title='" + DONATE_LINK_TOOLTIP + "' style='padding: 2px 10px 0px 15px'><a target='_blank' href='" + DONATE_LINK_URL + "'>" + DONATE_LINK_NAME + "</a></span>";
												addDonationClickedEvent(node);
											}
										}									

									}
								});
							}
							*/

						}
					}
					
					if (addCSS) {
						addStyle(css);
					}
					
					//if (window.top && window.top.location.href == document.location.href && webmailName) {
						//chrome.runtime.sendMessage({name:"sendGA", value:"blah"});
					//}
					
					// if not found above then try by cookie or title
					/*
					if (!email) {
						email = findEmailAddresses(document.cookie);
						if (!email) {
							email = findEmailAddresses(document.title);
						}
						if (email) {
							email = email[0];
						}
						if (email) {
							chrome.runtime.sendMessage({name:"saveEmail", email:email});
						}
					}
					*/
				 }
			);
			return true;
		}
		return true;
	};
	init();
})();