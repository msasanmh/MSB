!function(){function e(){chrome.extension.sendRequest({eventName:"injectContentScript",payload:{file:"content.js",allFrames:!0,runAt:"document_idle"}})}function t(e){if("INPUT"===e.tagName){var t="text";if(e.attributes.type&&(t=e.attributes.type.textContent.toLowerCase()),t in{text:1,password:1,email:1,tel:1})return!0}else if("SELECT"===e.tagName)return!0;return!1}function n(i){t(i.srcElement)&&(document.removeEventListener("focus",n,!0),e())}var i=document.documentElement;if("iframe_content.js"!=i.attributes.idmeScript&&"content.js"!=i.attributes.idmeScript&&(i.attributes.idmeScript="iframe_content.js",document.defaultView!=document.defaultView.top))try{{var a=window.frameElement,s=a.ownerDocument;s.location.host}i.attributes.idmeScript="content.js",a.getAttribute("id")||a.setAttribute("id","mmFrameId_"+Math.random()),chrome.extension.sendRequest({eventName:"processFormsInNewFrame",frame_id:a.getAttribute("id")})}catch(r){document.activeElement&&"BODY"!=document.activeElement.tagName?e():document.addEventListener("focus",n,!0)}}();