"use strict";
var plugin = {};

var screenshot = {
    path: 'filesystem:chrome-extension://' + chrome.i18n.getMessage("@@extension_id") + '/temporary/',
    generated: false,
    newwholepage: true,
    enableNpapi: false,
    imgData: null,

    selectedOptionFunction: function(callback) {
        chrome.tabs.executeScript(null, {file: "js/consentNimbus.js"}, function() {
            callback();
        });
    },

    detectOS: function() {
//        return /Win||Linux/.test(window.navigator.platform) && !/CrOS/.test(window.navigator.userAgent);
        return screenshot.enableNpapi;
    },

    createMenu: function() {
        var root = chrome.contextMenus.create({
            "title": chrome.i18n.getMessage("appName"),
            "contexts": ["all"]
        });

        chrome.contextMenus.create({
            title: chrome.i18n.getMessage("popupBtnVisible"),
            contexts: ["all"],
            parentId: root,
            onclick: function() {
                screenshot.captureVisible()
            }
        });

        chrome.contextMenus.create({
            title: chrome.i18n.getMessage("popupBtnArea"),
            contexts: ["all"],
            parentId: root,
            onclick: function() {
                screenshot.captureSelected()
            }
        });

        chrome.contextMenus.create({
            title: chrome.i18n.getMessage("popupBtnScroll"),
            contexts: ["all"],
            parentId: root,
            onclick: function() {
                screenshot.scrollSelected()
            }
        });

        chrome.contextMenus.create({
            title: chrome.i18n.getMessage("popupBtnEntire"),
            contexts: ["all"],
            parentId: root,
            onclick: function() {
                screenshot.captureEntire()
            }
        });

        if (screenshot.detectOS()) {
            chrome.contextMenus.create({
                title: chrome.i18n.getMessage("popupBtnWindow"),
                contexts: ["all"],
                parentId: root,
                onclick: function() {
                    screenshot.captureWindow()
                }
            });
        }

        chrome.contextMenus.create({
            title: "separator",
            type: "separator",
            contexts: ["all"],
            parentId: root
        });

        chrome.contextMenus.create({
            title: chrome.i18n.getMessage("popupBtnOptions"),
            contexts: ["all"],
            parentId: root,
            onclick: function() {
                chrome.tabs.create({url: 'options.html'}, function(tab) {
                });
            }
        });


    },
    openPage: function(url) {
        chrome.tabs.create({url: url}, function(tab) {
        });
    },
    captureEntire: function() {
        var screencanvas = {};

        function sendScrollMessage(tab) {
            screenshot.newwholepage = true;
            screencanvas = {};

            if (scrollToCrop == true) {
                chrome.tabs.sendRequest(tab.id, {msg: 'scrollPage', 'scrollToCrop': true, 'xs': xs, 'ys': ys, 'ws': ws, 'hs': hs }, function(response) {
                });
            } else {
                chrome.tabs.sendRequest(tab.id, {msg: 'scrollPage', 'scrollToCrop': false, 'hideFixedElements': (localStorage.hideFixedElements === 'true')}, function(response) {
                });
            }
        }

        if (!screenshot.generated) {
            screenshot.generated = true;
            chrome.extension.onRequest.addListener(function(request, sender, callback) {
                var fn = {'capturePage': capturePage,
                    'openPage': openPage}[request.msg];
                if (fn) {
                    fn(request, sender, callback);
                }
            });
        }

        function capturePage(data, sender, callback) {
            var z = data.devicePixelRatio || 1;
            var canvas;
            if (screenshot.newwholepage) {
                screenshot.newwholepage = false;
                canvas = document.createElement('canvas');
                canvas.width = Math.round(data.totalWidth * z);
                canvas.height = Math.round(data.totalHeight * z);
                screencanvas.canvas = canvas;
                screencanvas.ctx = canvas.getContext('2d');
            }

            chrome.tabs.captureVisibleTab(null, {format: 'png', quality: 100}, function(dataURI) {
                if (dataURI) {
                    var image = new Image();
                    image.onload = function() {
                        screencanvas.ctx.drawImage(image, Math.round(data.x * z), Math.round(data.y * z), Math.round(data.width * z), Math.round(data.height * z));
                        callback(true);
                    };
                    image.src = dataURI;
                }
            });
        }

        function openPage(data) {
            var z = data.devicePixelRatio || 1;

            var dataurl = screencanvas.canvas.toDataURL();
            var name = 'screencapture.png';
            var nimbus;
            if (scrollToCrop == true) {
                scrollToCrop = false;
                var fonData = screencanvas.ctx.getImageData(Math.round(data.x * z), Math.round(data.y * z), Math.round(data.w * z), Math.round(data.h * z));

                screencanvas.canvas.width = Math.round(data.w * z);
                screencanvas.canvas.height = Math.round(data.h * z);
                screencanvas.ctx.width = Math.round(data.w * z);
                screencanvas.ctx.height = Math.round(data.h * z);

                screencanvas.ctx.putImageData(fonData, 0, 0);

                dataurl = screencanvas.canvas.toDataURL('image/' + localStorage.format, localStorage.imageQuality/100);

                name = Date.now() + 'screencapture.' + localStorage.format;

                nimbus = nimbusScroll?'nimbus':undefined;
                nimbusScroll = false;
            }

            screenshot.createBlob(dataurl, name, function() {
                localStorage.imgdata = screenshot.path + name;
                if (saveScroll == true) {
                    saveScroll = false;
                    pathImg = localStorage.imgdata;
                    screenshot.setScreenName(function (pageinfo) {
                        screenshot.download({
                            url: pathImg,
                            pageinfo: pageinfo
                        });
                    });
                } else {
                    screenshot.createEditPage(nimbus);
                }
            });
        }

        chrome.tabs.getSelected(null, function(tab) {
            chrome.tabs.executeScript(tab.id, {file: "js/page.js"}, function() {
                sendScrollMessage(tab);
            });
        });

    },
    setScreenName: function(cb) {
        localStorage.screenname = 'screenshot-by-nimbus';

        chrome.tabs.getSelected(null, function(tab) {
            var info = {'url': tab.url, 'title': tab.title, 'time': getTimeStamp()};
            localStorage.pageinfo = JSON.stringify(info);
            localStorage.screenname = screenshot.getFileName(info);

            if(typeof cb == 'function') cb(info);
//            name = contentURL.split('?')[0].split('#')[0];
//            if (name) {
//                name = name.replace(/^https?:\/\//, '').replace(/[^A-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^[_\-]+/, '').replace(/[_\-]+$/, '');
//            }
        });

    },
    captureSelected: function() {
        chrome.tabs.insertCSS(null, {file: "css/jquery.Jcrop.css"});
        chrome.tabs.insertCSS(null, {file: "css/stylecrop.css"});


        chrome.tabs.executeScript(null, {file: "js/jquery.js"}, function() {
            chrome.tabs.executeScript(null, {file: "js/jquery.Jcrop.js"}, function() {
                chrome.tabs.executeScript(null, {file: "js/crop.js"}, function() {
                    chrome.tabs.captureVisibleTab(null, {format: 'png', quality: 100}, function(img) {
                        localStorage.imgdata = img;
                        chrome.tabs.getSelected(null, function(tab) {
                            chrome.tabs.sendRequest(tab.id, {msg: 'crop', image: img});
                        });
                    });
                });
            });
        });

    },

    scrollSelected: function() {
        chrome.tabs.insertCSS(null, {file: "css/jquery.Jcrop.css"});
        chrome.tabs.insertCSS(null, {file: "css/stylecrop.css"});

        chrome.tabs.executeScript(null, {file: "js/jquery.js"}, function() {
            chrome.tabs.executeScript(null, {file: "js/jquery.Jcrop.js"}, function() {
                chrome.tabs.executeScript(null, {file: "js/scrollCrop.js"}, function() {

                })
            })
        })

    },

    captureVisible: function() {
        chrome.tabs.captureVisibleTab(null, {format: 'png', quality: 100}, function(img) {
            localStorage.imgdata = img;
            screenshot.createEditPage();
        });
    },
    captureWindow: function() {},
    captureScreenCallback: function(data) {
        screenshot.createBlob("data:image/bmp;base64," + data, 'screencapture.png', function() {
            localStorage.imgdata = screenshot.path + 'screencapture.png';
            screenshot.createEditPage();
        });

    },
    createBlob: function(dataURI, name, callback) {
        screenshot.imgData = dataURI;
        var byteString = atob(dataURI.split(',')[1]);
        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
        var ab = new ArrayBuffer(byteString.length);
        var ia = new Uint8Array(ab);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        var blob = new Blob([ab], {type: mimeString});

        function onwriteend() {
//            window.open('filesystem:chrome-extension://' + chrome.i18n.getMessage("@@extension_id") + '/temporary/' + name);
            if (callback) callback(blob.size);
        }

        function errorHandler() {
            console.log('uh-oh');
        }

        window.webkitRequestFileSystem(TEMPORARY, 1024 * 1024, function(fs) {
            fs.root.getFile(name, {create: true}, function(fileEntry) {
                fileEntry.createWriter(function(fileWriter) {
                    fileWriter.onwriteend = onwriteend;
                    fileWriter.write(blob);
                }, errorHandler);
            }, errorHandler);
        }, errorHandler);

    },

    createBlank: function() {

        var canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 800;

        var ctx = canvas.getContext('2d');

        ctx.fillStyle = "#FFF";
        ctx.fillRect(0, 0, 800, 800);

        localStorage.imgdata = canvas.toDataURL();
        screenshot.createEditPage('blank');
    },
    createEditPage: function(params) {
        var option = params || localStorage.enableEdit;
        switch (option) {
            case 'copy':
                screenshot.copyToClipboard(localStorage.imgdata);
                break;
            case 'save':
                screenshot.setScreenName(function (pageinfo) {
                    screenshot.convertBase64To(localStorage.imgdata, function (data) {
                        screenshot.download({
                            url: data,
                            pageinfo: pageinfo
                        });
                    })
                });
                break;
            case 'edit':
            case 'done':
            default:
                screenshot.setScreenName();
                chrome.tabs.create({url: 'edit.html' + ((option == 'edit') ? '' : ('?' + option))}, function(tab) {
                });
                break;
        }
    },
    init: function() {
        screenshot.createMenu();

    },
    copyToClipboard: function(img) {

//        var text = chrome.i18n.getMessage("notificationCopy");
//        if (!screenshot.enableNpapi || !plugin.saveToClipboard(img)) {
//            text = chrome.i18n.getMessage("notificationWrong");
//        }
//
//        var notification = webkitNotifications.createNotification('favicon.png', chrome.i18n.getMessage("appName"), text);
//        notification.show();
//        window.setTimeout(function() {
//            notification.cancel();
//        }, 5000);
    },
    convertBase64To: function(data, cb){
        if (localStorage.format == 'png') {
                cb(data);
        } else {
            var img = new Image();
            img.onload = function () {
                var canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                var ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, img.width, img.height);
                var fonData = ctx.getImageData(0, 0, img.width, img.height);
                var dataurl = canvas.toDataURL('image/' + localStorage.format, localStorage.imageQuality/100);
                cb(dataurl);
            };
            img.src = localStorage.imgdata;
        }
    },
    download: function(data) {
        //TODO bug in Chrome 35 on Ubuntu
        if(/Linux/.test(window.navigator.platform) && /Chrome\/35/.test(window.navigator.userAgent)){
            localStorage.enableSaveAs = 'false';
        }
        console.log(data.url);
        chrome.downloads.download({
            url: data.url,
            filename: screenshot.getFileName(data.pageinfo, true),
            saveAs: (localStorage.enableSaveAs !== 'false')
        }, function(downloadId) {
        });
    },
    getFileName: function(pageinfo, format) {
        var s = localStorage.fileNamePattern;
        if (typeof pageinfo == 'object') {
            try {
                s = s.replace(/{url}/, pageinfo.url || '')
                    .replace(/{title}/, pageinfo.title || '')
                    .replace(/{domain}/, pageinfo.url.match(/^[^/]+\/\/([^/]+)/)[1] || '')
                    .replace(/{date}/, pageinfo.time.split(' ')[0] || '')
                    .replace(/{time}/, pageinfo.time.split(' ')[1] || '');
            } catch (e) {
                console.log(s);
            }
        }
        return s.replace(/[\*\|\\\:\"\<\>\?\/]+/ig, ' ') + (format ? ('.' + localStorage.format) : '');
    }
};

function getTimeStamp() {
    var y, m, d, h, M, s;
    var time = new Date();
    y = time.getFullYear();
    m = time.getMonth() + 1;
    d = time.getDate();
    h = time.getHours();
    M = time.getMinutes();
    s = time.getSeconds();
    if (m < 10) m = '0' + m;
    if (d < 10) d = '0' + d;
    if (h < 10) h = '0' + h;
    if (M < 10) M = '0' + M;
    if (s < 10) s = '0' + s;
    return    y + '-' + m + '-' + d + ' ' + h + '-' + M + '-' + s;
}

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {

    if (request.msg == 'cut') {
        localStorage.imgdata = request.img;
        screenshot.createEditPage();
    } else if (request.msg === 'copytoclipboard') {
        screenshot.copyToClipboard(request.img)
    } else if (request.msg === 'sendtonimbus') {
        localStorage.imgdata = request.img;
        screenshot.createEditPage('nimbus');
    } else if (request.msg === 'openpage') {
        screenshot.openPage(request.url);
    } else if (request.msg === 'getformat') {
        sendResponse({
            format:localStorage.format,
            quality:localStorage.imageQuality
        });
    } else if (request.msg === 'saveCropPosition') {
        localStorage.cropPosition = JSON.stringify(request.position);
    } else if (request.msg === 'getCropPosition') {
        sendResponse((localStorage.saveCropPosition === 'true') && JSON.parse(localStorage.cropPosition));
    } else if (request.msg === 'saveCropScrollPosition') {
        localStorage.cropScrollPosition = JSON.stringify(request.position);
    } else if (request.msg === 'getCropScrollPosition') {
        sendResponse((localStorage.saveCropPosition === 'true') && JSON.parse(localStorage.cropScrollPosition));
    } else if (request.msg === 'getfilename') {
        request.pageinfo.time = getTimeStamp();
        sendResponse(screenshot.getFileName(request.pageinfo, false));
    }

});

// these variables are responsible for the ability of all functions
var onTabRealy, onClassHas;
//these variables are responsible for the operation of each function in separate tabs
var thisCrop, thisEr, thisScrollEr;
//These variables are parameters which are responsible for a function to scroll
var xs, ys, ws, hs, scrollToCrop = false, saveScroll = false, pathImg, nimbusScroll = false;

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {

    if (request.operation == 'cap') {
        xs = request.xs;
        ys = request.ys;
        ws = request.ws;
        hs = request.hs;
    }

    if (request.operation == 'cropScroll') {
        scrollToCrop = true;
        screenshot.captureEntire()
    }

    if (request.operation == 'nimbusScroll') {
        nimbusScroll = true;
        scrollToCrop = true;
        screenshot.captureEntire()
    }

    if (request.operation == 'saveScroll') {
        scrollToCrop = true;
        saveScroll = true;
        screenshot.captureEntire();
    }

    if (request.operation == 'onTab') {
        onTabRealy = request.parameter;
        onClassHas = 'classHas';

    }

    if (request.operation == 'Crop') {
        thisCrop = request.parameter;
    }

    if (request.operation == 'Er') {
        thisEr = request.parameter;
    }

    if (request.operation == 'Scroll') {
        thisScrollEr = request.parameter;
    }


    if (request.operation == 'hotkeys') {
        sendResponse({hotkeys: localStorage.hotkeys});
    } else if (request.operation == 'hotkey') {
        if (request.name == 'entire') {
            screenshot.captureEntire();
        }
        if (request.name == 'selected') {
            screenshot.captureSelected();
        }
        if (request.name == 'scroll') {
            screenshot.scrollSelected();
        }
        if (request.name == 'visible') {
            screenshot.captureVisible();
        }
        if (request.name == 'window') {
            screenshot.captureWindow();
        }
    }
});

if (localStorage.hotkeys) {
    var hotkeys = JSON.parse(localStorage.hotkeys);
    localStorage.hotkeys = JSON.stringify({
        visible: hotkeys.visible || 49,
        selected: hotkeys.selected || 50,
        scroll: hotkeys.scroll || 54,
        entire: hotkeys.entire || 52,
        window: hotkeys.window || 53
    });
} else {
    localStorage.hotkeys = JSON.stringify({visible: '49', selected: '50', scroll: '51', entire: '52', window: '53'});
}

localStorage.format = localStorage.format || 'png';
localStorage.imageQuality = localStorage.imageQuality || '92';
localStorage.enableEdit = localStorage.enableEdit || 'edit';
localStorage.quickCapture = localStorage.quickCapture || 'false';
localStorage.enableSaveAs = localStorage.enableSaveAs || 'true';
localStorage.saveCropPosition = localStorage.saveCropPosition || 'false';
localStorage.hideFixedElements = localStorage.hideFixedElements || 'false';
localStorage.cropPosition = localStorage.cropPosition || JSON.stringify({"x":50,"y":50,"x2":450,"y2":250,"w":400,"h":200});
localStorage.cropScrollPosition = localStorage.cropScrollPosition || JSON.stringify({"x":50,"y":50,"x2":450,"y2":250,"w":400,"h":200});
localStorage.fileNamePattern = localStorage.fileNamePattern || 'screenshot-{domain} {date} {time}';
if (!localStorage['firstInstall']) {
    if(navigator.userAgent.search(/Opera/) < 0) screenshot.openPage('http://nimbus-screenshot.everhelper.me/install.php');
    localStorage['firstInstall'] = 'false';
}

window.onload = function() {
    screenshot.init();
};



