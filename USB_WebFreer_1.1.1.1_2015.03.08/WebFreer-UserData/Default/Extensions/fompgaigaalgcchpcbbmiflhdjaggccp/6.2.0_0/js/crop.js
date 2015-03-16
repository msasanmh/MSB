(function($) {

    var imgdata = null;
    var positionLoupe = {x: 0, y: 0};
    var parameters;
    var format = 'png';
    var quality = 90;

    function showLoupe(e) {
        var loupe = $("#theloupe");

        if (loupe.is(":hidden")) return;

        var img = document.getElementById('areaimage');

        var canvas = document.getElementById('theloupecanvas');
        var context = canvas.getContext('2d');

        var wi = document.documentElement.clientWidth;
        var hi = document.documentElement.clientHeight;

        var x = e.clientX - 15;
        var y = e.clientY - 15;
        var h = 30;
        var w = 30;
        var x2 = 0;
        var y2 = 0;

        var lh = loupe.height() + 20;
        var lw = loupe.width() + 20;

        if (e.clientX < lw + 5 && e.clientY < lh + 5) {
            positionLoupe = {x: wi - lw - 10, y: hi - lh - 10};
        }
        if (e.clientX > (wi - lw - 5) && e.clientY > (hi - lh - 5)) {
            positionLoupe = {x: 0, y: 0};
        }

        loupe.css({top: positionLoupe.y + 10, left: positionLoupe.x + 10});

        var s = loupe.find('span');
        $(s[0]).html('X = ' + e.clientX);
        $(s[1]).html('Y = ' + e.clientY);

        context.canvas.width = 240;
        context.canvas.height = 240;

        if (x < 0) {
            x2 = (-8) * x;
            x = 0;
        }
        if (y < 0) {
            y2 = (-8) * y;
            y = 0;
        }

        if ((e.clientX + 15) > wi) {
            w = wi - e.clientX + 14;
        }
        if ((e.clientY + 15) > hi) {
            h = hi - e.clientY + 14;
        }

        var zoom = 8;
        var offctx = document.createElement('canvas').getContext('2d');
        offctx.drawImage(img, x, y, w, h, 0, 0, w, h);
        var imgDt = offctx.getImageData(0, 0, w, h).data;

        for (var xx = 0; xx < w; ++xx) {
            for (var yy = 0; yy < h; ++yy) {
                var i = (yy * w + xx) * 4;
                var r = imgDt[i];
                var g = imgDt[i + 1];
                var b = imgDt[i + 2];
                var a = imgDt[i + 3];
                context.fillStyle = "rgba(" + r + "," + g + "," + b + "," + (a / 255) + ")";
                context.fillRect(x2 + xx * zoom, y2 + yy * zoom, zoom, zoom);
            }
        }

        context.lineWidth = 1;
        context.strokeStyle = "#FF6600";

        context.beginPath();

        context.moveTo(120, 0);
        context.lineTo(120, 240);

        context.moveTo(0, 120);
        context.lineTo(240, 120);

        context.stroke();

    }

    function destroyCrop() {
        $('#areafon').remove();
        $('html').css("overflow", "auto");
        window.nimbusChromeOption = false;
        window.thisCrop = false;
    }

    function cropImage(save) {
        var c = parameters;
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        var data = null;

        canvas.width = c.w;
        canvas.height = c.h;

        var img = document.getElementById('areaimage');

        context.drawImage(img, c.x, c.y, c.w, c.h, 0, 0, c.w, c.h);
        if (save) {
        console.log(format, quality/100);
            data = canvas.toDataURL('image/'+format, quality/100);
            $('#imgdownload').attr('href', data);
            chrome.extension.sendMessage({msg: 'getfilename', pageinfo: {'url': document.URL, 'title': document.title}}, function(response) {
                $('#imgdownload').attr('download',response+'.'+format);
            });
        } else {
            chrome.extension.sendMessage({msg: 'cut', img: canvas.toDataURL('image/png')}, function(response) {
                console.log(response);
            });
        }

    }

    function createCoords(c) {
        parameters = c;
        saveCropPosition(c);
        if ($("div").is("#screenshotbutton") && $("div").is("#screenshotsize")) {
            showCoords(c);
            cropImage(true);
            return;
        }

        var btne = $('<button/>', {
            html: '<i class="edit"></i><div class="name">'+chrome.i18n.getMessage("cropBtnEdit")+'</div>',
            'id': 'screenshoted',
            'class': 'edit_btn edit'
        });

        var btnc = $('<button/>', {
            html: '<i class="cancel"></i><div class="name">'+chrome.i18n.getMessage("cropBtnCancel")+'</div>',
            'id': 'screenshotcn',
            'class': 'edit_btn cancel'
        });

        var btns = $('<div/>', {
            'id': 'screenshotbutton',
            'class': 'nimbus_screenshot_buttons'
        });

        btns.append(btne);
        btns.append('<a class="edit_btn save" id="imgdownload" href="" download="screenshot-by-nimbus"><i class="save"></i><div class="name">'+chrome.i18n.getMessage("cropBtnSave")+'</div></a>');
        btns.append(btnc);

        var drag = $('.jcrop-dragbar').first();
        drag.before('<div id="screenshotsize"></div>');
        drag.before(btns);

        var btnsdone = $('<div/>', {
            'id': 'screenshotbuttonsdone',
            'class': 'nimbus_screenshot_buttons'
        });
//        var btncopy = $('<button/>', {
//            html: '<i class="copy"></i>',
//            'id': 'screenshotcopy',
//            'class': 'edit_btn copy',
//            'title': chrome.i18n.getMessage("cropBtnCopy")
//        });

        var btnnimbus = $('<button/>', {
            html: '<i class="nimbus"></i>',
            'id': 'screenshotnimbus',
            'class': 'edit_btn nimbus',
            'title': chrome.i18n.getMessage("cropBtnNimbus")
        });
//        btnsdone.append(btncopy);
        btnsdone.append(btnnimbus);
        drag.before(btnsdone);

//        btncopy.bind('click', function() {
//            chrome.extension.sendMessage({msg: 'copytoclipboard', img: $('#imgdownload').attr('href')}, function(response) {
//                console.log(response);
//            });
//            destroyCrop();
//        });

        btnnimbus.bind('click', function() {
            chrome.extension.sendMessage({msg: 'sendtonimbus', img: $('#imgdownload').attr('href')}, function(response) {
                console.log(response);
            });
            destroyCrop();
        });

        btnc.bind('click', function() {
            destroyCrop();
        });

        btne.bind('click', function() {
            cropImage();
            destroyCrop();
        });

        var loupe = $('#theloupe');
        var events = {
            'mouseenter': function(e) {
                loupe.show()
            },
            'mouseleave': function(e) {
                loupe.hide()
            }
        };
        $(".jcrop-handle").bind(events);
        $(".jcrop-dragbar").bind(events);
        $(".jcrop-tracker").last().bind(events);

        $('.edit_btn').hover(function() {
            $(".name", this).stop().animate({top: '35px', bottom: '0px'}, {queue: false, duration: 160});
        }, function() {
            $(".name", this).stop().animate({top: '47px', bottom: '0'}, {queue: false, duration: 160});
        });

        cropImage(true);
        showCoords(c);
    }

    function saveCropPosition(c) {
        chrome.extension.sendMessage({msg: 'saveCropPosition', position: c}, function(response) {
            console.log(response);
        });
    }

    function showCoords(c) {
        $('#screenshotsize').html('<span>' + c.w + ' x ' + c.h + '</span>');

        if ((c.h + c.y + 55) > $(window).height()) {
            $('#screenshotbutton').css('bottom', '8px');
        } else {
            $('#screenshotbutton').css('bottom', '-55px');
        }

        if ((c.w + c.x + 54) > $(window).width()) {
            $('#screenshotbuttonsdone').css('right', '8px');
        } else {
            $('#screenshotbuttonsdone').css('right', '-53px');
        }

        if (c.y < 20) {
            $('#screenshotsize').css('top', '5px');
        } else {
            $('#screenshotsize').css('top', '-20px');
        }
    }

    if (!window.screencaptureinit) {

        window.screencaptureinit = true;

        chrome.extension.onRequest.addListener(function(req) {

            if (req.msg == 'crop') {
                window.nimbusChromeOption = true;
                window.thisCrop = true;

                chrome.extension.sendMessage({msg: 'getformat'}, function(response) {
                    format = response.format;
                    quality = response.quality;
                });

                $('html').css("overflow", "hidden");
                imgdata = req.image;

                var areafon = jQuery('<div/>', {
                    id: 'areafon'
                }).appendTo('body');

                var areaimage = jQuery('<img>', {
                    id: 'areaimage',
                    src: imgdata
                }).appendTo(areafon);

                var jcrop = $.Jcrop($(areaimage), {
                    onSelect: createCoords,
                    onChange: showCoords
                });

                chrome.extension.sendMessage({msg: 'getCropPosition'}, function(response) {
                    if (typeof response === 'object') {
                        jcrop.setSelect([response.x, response.y, response.x2, response.y2]);
                    }
                });

                areafon.append('<div id="theloupe"><canvas id="theloupecanvas"></canvas><span>X = 0</span><span>Y = 0</span></div>');

                areafon.bind({
                    'mousemove': function(e) {
                        showLoupe(e);
                    },
                    'mouseenter': function(e) {
                        $('#theloupe').show();
                    },
                    'mouseleave': function(e) {
                        $('#theloupe').hide();
                    }
                });

                areafon.bind("contextmenu", function() {
                    destroyCrop();
                    return false;
                });

                areafon.append('<div class="cropNotification">Drag and Capture Page (Press Esc to Exit)</div>');

                window.addEventListener('keydown', function(evt) {
                    evt = evt || window.event;
                    if (evt.keyCode == 27) {
                        destroyCrop();
                    }
                }, false);

            }

        });

    }
}(jQuery));

