(function($) {
    window.nimbusChromeOption = true;
    window.thisScrollEr = true;
    var jcrop;
    var firstMove = 0;
    var isDown;
    scrollCrop();

    function getSize() {
        var body = document.body,
            html = document.documentElement,
            page_w = Math.max(body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth),
            page_h = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
        return {w: page_w, h: page_h};
    }

    function scrollCrop() {

        var size = getSize();
        var pole = $('<div id="areafon">').appendTo('body');
        var position = $('body').offset();
        pole.append('<div class="cropNotification">Drag and Capture Page (Press Esc to Exit)</div>');

        pole.css({
            width: size.w,
            height: size.h,
            position: 'absolute',
            left: '0',
            top: '0',
            zIndex: 999999,
            backgroundColor: 'rgba(0,0,0,0.2)'
        });

        var crop = $('<div>').appendTo(pole);

        crop.css({
            opacity: '0.1',
            width: '100%',
            height: '100%',
            position: 'absolute',
            left: '0px',
            top: '0px'
        });

        jcrop = $.Jcrop(crop, {
            onSelect: createCoords,
            //setSelect:   [size.w,size.w, size.w-100, size.w-100 ],
            onChange: showCoords,
            onRelease: function() {
                pole.css({backgroundColor: 'rgba(0,0,0,0.2)'});
            }
        });

        chrome.extension.sendMessage({msg: 'getCropScrollPosition'}, function(response) {
            if (typeof response === 'object') {
                if(response.x2 <= size.w && response.y2 <= size.h) {
                    jcrop.setSelect([response.x, response.y, response.x2, response.y2]);
                    $("html, body").animate({ scrollTop: response.y}, "slow");
                    pole.css({backgroundColor: 'transparent'});
                }
            }
        });

        $('.jcrop-holder').css({
            background: '',
            overflow: 'hidden'
        });

        $('.jcrop-tracker').bind("mousedown", function() {
            pole.css({backgroundColor: 'transparent'});
        });

        pole.bind("contextmenu", function() {
            destroyCrop();
            return false;
        });
    }

    $("#areafon").bind('mousemove', function(event) {
        $('body').mouseup(function() {
            firstMove = 1000000;
        });
        if ($('.bottom').width() > firstMove) {
            autoScroll(event);
        }
    });


    function autoScroll(event) {
        if (isDown == false) {
            return false;
        }

        var clientY = event.clientY, clientX = event.clientX, restY = window.innerHeight - clientY, restX = window.innerWidth - clientX;
        if (clientY < 20) document.body.scrollTop -= 8;
        if (clientX < 40) document.body.scrollLeft -= 8;
        if (restY < 40) document.body.scrollTop += 40 - restY;
        if (restX < 40) document.body.scrollLeft += 40 - restX;
    }

    function createCoords(c) {
        isDown = true;
        saveCropPosition(c);

        $(".jcrop-handle, .jcrop-dragbar, .jcrop-hlin, .jcrop-tracker ").mouseup(function() {
            isDown = false;
        });

        $(".jcrop-handle, .jcrop-dragbar, .jcrop-hlin, .jcrop-tracker ").mousedown(function() {
            isDown = true;
            $("#areafon").bind('mousemove', function(event) {
                autoScroll(event);
            });
        });

        if ($("div").is("#screenshotbutton") && $("div").is("#screenshotsize")) {
            showCoords(c);
            //cropImage(true);
            return;
        }

        var btne = $('<button/>', {
            html: '<i class="edit"></i><div class="name">Edit</div>',
            'id': 'screenshoted',
            'class': 'edit_btn edit'
        });

        var btnc = $('<button/>', {
            html: '<i class="cancel"></i><div class="name">Cancel</div>',
            'id': 'screenshotcn',
            'class': 'edit_btn cancel'
        });

        var btns = $('<div/>', {
            'id': 'screenshotbutton',
            'class': 'nimbus_screenshot_buttons'
        });

        btns.append(btne);

        btns.append('<a class="edit_btn save" id="imgdownload"  ><i class="save"></i><div class="name">Save</div></a>');
        btns.append(btnc);

        var drag = $('.jcrop-dragbar').first();
        drag.before('<div id="screenshotsize"></div>');
        drag.before(btns);

        var btnsdone = $('<div/>', {
            'id': 'screenshotbuttonsdone',
            'class': 'nimbus_screenshot_buttons'
        });

        var btnnimbus = $('<button/>', {
            html: '<i class="nimbus"></i>',
            'id': 'screenshotnimbus',
            'class': 'edit_btn nimbus',
            'title': chrome.i18n.getMessage("cropBtnNimbus")
        });
        btnsdone.append(btnnimbus);
        drag.before(btnsdone);

        btnnimbus.bind('click', function() {
            destroyCrop();
            chrome.extension.sendRequest({'operation': 'nimbusScroll'});
        });

        btnc.bind('click', function() {
            destroyCrop();
        });

        btne.bind('click', function() {
            destroyCrop();

            chrome.extension.sendRequest({'operation': 'cropScroll'});

        });

        btns.bind('click', function() {
            destroyCrop();
            chrome.extension.sendRequest({operation: 'saveScroll', 'scrollToCrop': false}, function(response) {
                console.log(response);
            });
        });

        $('.edit_btn').hover(function() {
            $(".name", this).stop().animate({top: '35px', bottom: '0px'}, {queue: false, duration: 160});
        }, function() {
            $(".name", this).stop().animate({top: '47px', bottom: '0'}, {queue: false, duration: 160});
        });

        showCoords(c);
    }

    function saveCropPosition(c) {
        chrome.extension.sendMessage({msg: 'saveCropScrollPosition', position: c}, function(response) {
            console.log(response);
        });
    }

    function destroyCrop() {
        window.nimbusChromeOption = false;
        window.thisScrollEr = false;
        $('#areafon').remove();
    }

    function showCoords(c) {
        $('#screenshotsize').html('<span>' + c.w + ' x ' + c.h + '</span>');

        if ((c.h + c.y + 55) > $(window).height()) {
            $('#screenshotbutton').css('bottom', '8px');
        } else {
            $('#screenshotbutton').css('bottom', '-55px');
        }
        cropImage(c)
    }

    function cropImage(c) {
        var xs = c.x, ys = c.y, ws = c.w, hs = c.h;

        chrome.extension.sendRequest({'operation': 'cap', 'xs': xs, 'ys': ys, 'ws': ws, 'hs': hs });
    }

    window.addEventListener('keydown', function(evt) {
        evt = evt || window.event;
        if (evt.keyCode == 27) {
            destroyCrop();
        }
    }, false);

}(jQuery));

