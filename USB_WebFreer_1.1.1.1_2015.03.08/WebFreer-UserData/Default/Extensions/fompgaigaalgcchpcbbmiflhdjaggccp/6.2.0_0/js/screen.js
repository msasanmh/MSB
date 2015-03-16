$(function() {

    var imgdata = localStorage.imgdata;
    var screenname = localStorage.screenname;
    var pageinfo = JSON.parse(localStorage.pageinfo || '{}');
    var imgnewdata = null;
    var image = $('#imageedit');
    var canvasManager;
    var jcrop;
    var tools = '#rectangle-styler';
    var authorized = false;
    var param = (function () {
        var p = window.location.href.match(/\?(\w+)$/);
        return (p && p[1]) || '';
    })();

    localStorage.fillColor = localStorage.fillColor || 'rgba(0,0,0,0);';
    localStorage.setting = localStorage.setting || JSON.stringify({width: '3', color: '#f00'});
    var setting = JSON.parse(localStorage.setting);
    $("#line-width").val(setting.width);
    $("#colortools").val(setting.color);
    $('#numbers').addClass((localStorage.enablenumbers === 'true')?'enable':'');

    (function(s){
        try {
            setting.shadow = JSON.parse(s)
        } catch (e) {
            setting.shadow = { enable: true, color: '#000000', blur: 5 };
        }
    })(localStorage.shadow);

    $('#editpanel select, .drop_panel input[type="checkbox"] ').styler();

    $("#fillcolor").spectrum({
        color: localStorage.fillColor,
        showAlpha: true,
        showButtons: false,
        move: function(color) {
            canvasManager.changeFillColor(color.toRgbString());
        }
    });

    $('#copy-to-clipboard').hide();

    window.copyUrlToClipboard = function(text) {
        $('body').append('<textarea id="url_for_copy"/>');
        var $test = $('#url_for_copy');
        $test.text(text || $('#linked input').val());
        $test.select();
        document.execCommand('copy');
        $.ambiance({message: chrome.i18n.getMessage("notificationUrlCopied")});
    };

    (function () {
        $('.size h5').text(chrome.i18n.getMessage("panelSize") + ':');
        $('.drawing_tools h5').text(chrome.i18n.getMessage("panelTools") + ':');
        $('.drawing_tools .options_tools h5').text(chrome.i18n.getMessage("panelParameters") + ':');
        $('.actions h5').text(chrome.i18n.getMessage("panelActions") + ':');

        $('#imgfordownload span').text(chrome.i18n.getMessage("doneTitle"));
        $('#done span').text(chrome.i18n.getMessage("editBtnDone"));
        $('#back span').text(chrome.i18n.getMessage("editBtnBack"));
        $('#save-nimbus span').text(chrome.i18n.getMessage("editBtnNimbus"));
        $('#save-image span').text(chrome.i18n.getMessage("editBtnSave"));
        $('#send-to-google span').text(chrome.i18n.getMessage("editBtnDrive"));
        $('#copy-to-clipboard span').text(chrome.i18n.getMessage("editBtnCopy"));
        $('#print-img span').text(chrome.i18n.getMessage("editBtnPrint"));

        $('#nimbus-comment-upload span').text(chrome.i18n.getMessage("nimbusBtnComment"));
        $('#nimbus-comment textarea').attr('placeholder', chrome.i18n.getMessage("nimbusCommentPlaceholder"));
        $('.nimbus_title span').text(chrome.i18n.getMessage("nimbusTitle"));
        $('.nimbus_info').text(chrome.i18n.getMessage("nimbusInfo"));
        $('span.private').text(chrome.i18n.getMessage("nimbusLabelPrivate"));

        var up = $('#user-panel .nimbus_form .nimbus-submit');
        up.find('button[name="signin"] span').text(chrome.i18n.getMessage("nimbusBtnLogin"));
        up.find('button[name="signup"] span').text(chrome.i18n.getMessage("nimbusBtnSignup"));
        up.find('button[name="confirm"] span').text(chrome.i18n.getMessage("nimbusBtnRemind"));


        var lp = $('#login-panel');
        lp.find('.nimbus_header').text(chrome.i18n.getMessage("nimbusHeaderLogin"));
        lp.find('.login').text(chrome.i18n.getMessage("nimbusLabelLogin") + ':');
        lp.find('.password').text(chrome.i18n.getMessage("nimbusLabelPassword") + ':');
        lp.find('#forgot-pass').text(chrome.i18n.getMessage("nimbusLabelForgotPass"));

        var rp = $('#register-panel');
        rp.find('.nimbus_header').text(chrome.i18n.getMessage("nimbusHeaderRegistration"));
        rp.find('.email').text(chrome.i18n.getMessage("nimbusLabelEmail") + ':');
        rp.find('.password').text(chrome.i18n.getMessage("nimbusLabelPassword") + ':');
        rp.find('.repass').text(chrome.i18n.getMessage("nimbusLabelRetypePass") + ':');

        var rpp = $('#remind-password-panel');
        rpp.find('.nimbus_header').text(chrome.i18n.getMessage("nimbusHeaderRemindPass"));
        rpp.find('.email').text(chrome.i18n.getMessage("nimbusLabelEmail") + ':');

        var np = $('#nimbus-panel');
        np.find('.username').text(chrome.i18n.getMessage("nimbusLabelUsername") + ':');
        np.find('.folder').text(chrome.i18n.getMessage("nimbusLabelFolder") + ':');
        np.find('.comment').text(chrome.i18n.getMessage("nimbusLabelComment") + ':');

        np.find('#my-uploads-nimbus span').text(chrome.i18n.getMessage("nimbusBtnMyUploads"));
        np.find('#save-to-nimbus span').text(chrome.i18n.getMessage("nimbusBtnStart"));

//        $('#select_folder #change_folder').text(chrome.i18n.getMessage("gDriveSelectFolder"));
        var gdf = $('#file_manager');
        gdf.find('.file_manager_title span').text(chrome.i18n.getMessage("gDriveTitle"));
        gdf.find('.future_folder_label').text(chrome.i18n.getMessage("gDriveLabel"));
        gdf.find('#btn_select span').text(chrome.i18n.getMessage("gDriveBtnDone"));

        $('#to-nimbus-pro').text(chrome.i18n.getMessage("limitHref"));
        var npi = $('.nimbus-pro-info');
        $(npi[0]).html(chrome.i18n.getMessage("limitNoSpace"));
        $(npi[1]).html(chrome.i18n.getMessage("limitDescription"));
        $('#go-to-nimbus-pro').text(chrome.i18n.getMessage("limitGoToPro"));
    })();

    function initPage() {

        $('#editcanva').width(image.width()).height(image.height());
        image.hide();

        canvasManager = $("#editcanva").canvasPaint();
        canvasManager.loadBackgroundImage(imgdata, function(){

                if ((param === 'done') || (param === 'nimbus')) {
                    $("#done").click();
                    if (param === 'nimbus') {
                        nimbus.show();
                    }
                } else if(image.width()*image.height() > 15000000 && /Win/.test(window.navigator.platform)){
//                    $("#done").click();
                    $.ambiance({message: chrome.i18n.getMessage("notificationWrongEditor"), type: "error", timeout: 10});
                }
        });
        canvasManager.changeStrokeSize(setting.width);
        canvasManager.changeStrokeColor(setting.color);
        canvasManager.changeFillColor(localStorage.fillColor);
        canvasManager.changeShadow(setting.shadow);
        canvasManager.setEnableNumbers(localStorage.enablenumbers === 'true');
        $('#colortools-styler').find('.text').css('background-color', setting.color);
        if (param === 'blank') {
            $('#open-image').show();

            var d = document.createElement('div');
            $(d).attr('id','drop-file')
                .text('Drop Image Here')
                .appendTo('#editcanva')
                .one('hover', function () {
                    $(this).hide();
                });
        }

        setPanelTop();

        addEvents();

        (function () {

            window.addEventListener('paste', function(event){

                if (!!imgnewdata) return true;
                try {
                    var items = (event.clipboardData || event.originalEvent.clipboardData).items;

                    if (!items[0].type.match('image.*')) {
                        $.ambiance({message: chrome.i18n.getMessage("notificationWrongInsert"), timeout: 1});
                        return true;
                    }

                    var blob = items[0].getAsFile();
                    var reader = new FileReader();
                    reader.onload = function(event){
                        if (param === 'blank') {
                            canvasManager.undoAll();
                            canvasManager.loadBackgroundImage(event.target.result);
                            $('#drop-file').hide();
                        } else {
                            canvasManager.loadImageObject(event.target.result);
                        }
                    };
                    reader.readAsDataURL(blob);
                } catch (e) {
                    console.log(e);
                }
            });

            function handleFileSelect(evt) {
                evt.stopPropagation();
                evt.preventDefault();

                var files = evt.target.files || (evt.dataTransfer && evt.dataTransfer.files);

                for (var i = 0, f; f = files[i]; i++) {

                    if (!f.type.match('image.*')) {
                        $.ambiance({message: chrome.i18n.getMessage("notificationInsertInfo"), timeout: 1});
                        continue;
                    }

                    var reader = new FileReader();

                    reader.onload = (function(theFile) {
                        return function(e) {
                            if (evt.type === "drop") {
                                canvasManager.loadImageObject(e.target.result, evt.pageX, evt.pageY)
                            } else {
                                canvasManager.undoAll();
                                canvasManager.loadBackgroundImage(e.target.result);
                                $('#drop-file').hide();
                            }
                        };
                    })(f);

                    reader.readAsDataURL(f);
                }
                return false;
            }


            function handleDragOver(evt) {
                evt.stopPropagation();
                evt.preventDefault();
//                evt.dataTransfer.dropEffect = 'copy';
                $(this).addClass('drop');
            }
            function handleDragEnd(evt) {
                $(this).removeClass('drop');
            }

            var dropZone = document.getElementById('editcanva');
            dropZone.addEventListener('dragover', handleDragOver, false);
            dropZone.addEventListener('drop', handleFileSelect, false);
            dropZone.addEventListener('drop', handleDragEnd, false);
            dropZone.addEventListener('dragleave', handleDragEnd, false);

            document.getElementById('file-open').addEventListener('change', handleFileSelect, false);

            $('#open-image').on('click', function () {
                $('#file-open').click();
            });

        })()

    }

    $(window).resize(function() {
        setPanelTop();
    });

    function setPanelTop() {
        var panel = $('#editpanel');
        var title = panel.find('h5');

        if ($('body').width() < 1400) {
            title.hide();
            $('.tools').css('max-width', '813px');
        } else {
            title.show();
            $('.tools').css('max-width', '1100px');
        }

        $('#photo').css('padding-top', (panel.height() + 10) + 'px');
        canvasManager.zoom(true);
    }

    var firstWidth = null;
    var firstHeight = null;

    function getSize() {
        var width = $('#editcanva').width();
        var height = $('#editcanva').height();
        if (firstWidth == null) {
            var firstWidth = width;
        }
        if (firstHeight == null) {
            var firstHeight = height;
        }

        return {w: width, h: height, fW: firstWidth, fH: firstHeight};
    }

    function destroyCrop() {
        if (jcrop) {
            jcrop.destroy();
            jcrop = undefined;

            if ($('#forcrop')) {
                $('#forcrop').remove()
            }
            $('#crop').removeClass('active');
            $(tools).addClass('active');
        }
    }

    function disableActive(btn) {
        $('#editpanel').find('button').removeClass('active');
        $('#editpanel').find('.jq-selectbox').removeClass('active');
        $(btn).addClass('active');
        if ($(btn).attr('id') !== 'crop') tools = btn;
        $("#resize").removeClass('active');
        $(".drop").removeClass('open');
    }

    function addEvents() {
        document.onkeydown = function(e) {
            var k = e.keyCode;

            if (k == 46) {
                canvasManager.delete();
            }

            if (e.ctrlKey) {
                if (k == 90) {
                    canvasManager.undo();
                    e.preventDefault();
                    return false;
                }
                if (k == 89) {
                    canvasManager.redo();
                    e.preventDefault();
                    return false;
                }
            }
            return true;
        };

        var saveimg = $("#save-img");
        var resizeimg = $(".drop.resize_image");
        var bg = $("#background");

        $('#back').click(function() {
            imgnewdata = null;
            saveimg.hide();
            bg.css('z-index', '1000');
            $('html').css("overflow", "auto");
            return false;
        });

        $('#editpanel button:not(#crop)').click(function() {
            destroyCrop()
        });

        $("#done").click(function() {
            canvasManager.done();

            var canvaFon = document.getElementById("canvasfon");
            var canvaBg = document.getElementById("canvasbg");

            var oCanvas = document.createElement('canvas');
            oCanvas.width = canvaFon.width;
            oCanvas.height = canvaFon.height;

            var ctx = oCanvas.getContext('2d');
            ctx.drawImage(canvaFon, 0, 0);
            ctx.drawImage(canvaBg, 0, 0);

            var previewImg = $('#preview');
            var imgfordw = $('#imgfordownload');
            var name = (new Date()).getTime() + 'screensave.';
            var format = localStorage.format || 'png';

            name += format;
            imgnewdata = oCanvas.toDataURL('image/'+format, localStorage.imageQuality/100);

            var bgScreen = chrome.extension.getBackgroundPage().screenshot;
            var path = bgScreen.path + name;
            bgScreen.createBlob(imgnewdata, name, function(size) {
                imgfordw.attr('href', path);
                previewImg.find('img').attr('src', path);
                var k = (size / 1000).toFixed(2);
                if (k < 1000) {
                    k = k.toString().replace(",", ".").replace(/\d{1,3}(?=(\d{3})+(?!\d))/g, "$&,") + " KB";
                } else {
                    k = (k / 1024).toFixed(2);
                    k = k.toString().replace(",", ".").replace(/\d{1,3}(?=(\d{3})+(?!\d))/g, "$&,") + " MB";
                }
                $('#indicator').find('.screenweight').html('<span>' + k + '</span>');
                nimbus.setScreenSize(size)
            });

            $('#indicator').find('.screensize').html('<span>' + canvaFon.width + ' x ' + canvaFon.height + '</span>');
            previewImg.find('img').load(function() {
                var w = previewImg.find('img').width();
                $('#indicator').css('width', w + 'px');
                $('#nimbus-comment').css('width', (w > 300 ? w : 680) + 'px');
                resizeImagePreview();
            });

            $('#message').hide();
            $('#linked').hide();
            bg.css('z-index', '1200');
            $('html').css("overflow", "hidden");
            saveimg.show();

            chrome.identity.getAuthToken({ 'interactive': false }, function(token) {
                if (typeof token === 'undefined') {
                    $('#choose-folder').hide();
                } else {
                    authorized = true;
                    setUploadFolderTooltip();
                }
            });

            if (nimbus.user_authorized()) {
                $('#choose-nimbus-share').show();
                $('#save-nimbus').attr('original-title', '');
//                $('#save-nimbus').attr('original-title', 'Upload to: ' + nimbus.uploadReadFolder().title);
            } else {
                $('#choose-nimbus-share').hide();
            }

            nimbusRate.showMessage();
            nimbusAccountPopup.init();
        });

        function resizeImagePreview() {
            var h = $('#save-img').height() + 20;
            var hb = $('#background').height();
//            console.log(h,hb);
//            var z = 1;
            var t = 20;
            if (h > hb) {
//                z = hb / h;
//                if (z < 0.75) {
//                    z = 0.75;
//                }
                t = 0;
            }
            $('#save-img').css('top', t + 'px');
//            $('#save-img').css('zoom', z);
        }

        $("#resize").click(function() {
            if ($('#resize-img').is(':visible')) {
                $("#resize").removeClass('active');
                resizeimg.removeClass('open');
            } else {
                $("#resize").addClass('active');
                var size = getSize();
                $('#img-width').val(size.w);
                $('#img-height').val(size.h);
                resizeimg.addClass('open');
            }
        });

        $('#resize-cancel').click(function() {
            $("#resize").removeClass('active');
            resizeimg.removeClass('open');
            return false;
        });

        $("#resize-img").find('form').submit(function() {
            var w = this.width.value;
            var h = this.height.value;
            canvasManager.changeSize(w * 1, h * 1);
            $("#resize").removeClass('active');
            resizeimg.removeClass('open');
            return false;
        });


        $("#shadow").click(function() {
            function hide () {
                $("#shadow").removeClass('active');
                $('.drop.tools_shadow').removeClass('open');
            }
            if ($('#tools-shadow').is(':visible')) {
                hide();
            } else {
                $("#shadow").addClass('active');
                var s = canvasManager.getShadow();
                $('#shadow-width').val(s.blur);
                $('#enable-shadow').prop("checked", s.enable).trigger('refresh');
                $('#colorshadow').val(s.color).trigger('refresh');
                $('#colorshadow-styler').find('.text').css('background-color', s.color);
                $('.drop.tools_shadow').addClass('open');
                $('#editcanva').one('mousedown', function () {
                    hide();
                })
            }
        });

        function getShadowParam() {
            return {
                enable: $('#enable-shadow').prop("checked"),
                blur: $('#shadow-width').val(),
                color: $('#colorshadow').val()
            }
        }

        $('#shadow-width').on('change', function(){
            setting.shadow = getShadowParam();
            canvasManager.changeShadow(setting.shadow, 'blur');
        });

        $('#enable-shadow').on('change', function(){
            setting.shadow = getShadowParam();
            canvasManager.changeShadow(setting.shadow, 'enable');
        });

        $('#colorshadow').on('change', function(){
            setting.shadow = getShadowParam();
            canvasManager.changeShadow(setting.shadow, 'color');
            $('#colorshadow-styler').find('.text').css('background-color', setting.shadow.color);
        });

        $('.percent').change(function() {
            destroyCrop();
            var z = +this.value;
            canvasManager.zoom(z);
            return false;
        });

        $("#zoomminus").click(function() {
            var z = canvasManager.getZoom();
            if (z > 0.25) {
                z -= 0.25;
            }
            $(".percent").val(z);
            $(".percent").trigger('refresh');
            canvasManager.zoom(z);
        });

        $("#zoomplus").click(function() {
            var z = canvasManager.getZoom();
            if (z < 2) {
                z += 0.25;
            }
            $(".percent").val(z);
            $(".percent").trigger('refresh');
            canvasManager.zoom(z);
        });


        $('#img-width').on('input', function() {
            if ($('#proportional').attr('checked')) {
                var size = getSize();
                $('#img-height').val(Math.round(this.value * size.h / size.w));
            }
        });

        $('#img-height').on('input', function() {
            if ($('#proportional').attr('checked')) {
                var size = getSize();
                $('#img-width').val(Math.round(this.value * size.w / size.h));
            }
        });

        $('#proportional-styler').click(function() {

            if ($('#proportional').attr('checked')) {
                var firstSize = getSize();
                $('#img-width').val(firstSize.fW);
                $('#img-height').val(firstSize.fH);
            }
        });

        $("#pen").click(function() {
            canvasManager.activatePen();
            disableActive(this);
        });

        $('#rectangle-styler').click(function() {
            if ($('#rectangle').val() === 'rectangle') {
                canvasManager.activateEmptyRectangle();
                $(this).find('.text').removeAttr('class').addClass('text').addClass('rectangle');
            } else {
                canvasManager.activateRoundedRectangle();
                $(this).find('.text').removeAttr('class').addClass('text').addClass('rounded_rectangle');
            }
            destroyCrop();
            disableActive(this);
        });

        $('#rectangle-styler .text').click(function() {
            if ($('#rectangle').val() === 'rectangle') {
                canvasManager.activateEmptyRectangle();
            } else {
                canvasManager.activateRoundedRectangle();
            }
            destroyCrop();
            disableActive($('#rectangle-styler'));
            return false;
        });

        $('#ellipse-styler').click(function() {
            if ($('#ellipse').val() === 'ellipse') {
                canvasManager.activateEllipse();
                $(this).find('.text').removeAttr('class').addClass('text').addClass('ellipse');
            } else {
                canvasManager.activateEmptyCircle();
                $(this).find('.text').removeAttr('class').addClass('text').addClass('sphere');
            }
            destroyCrop();
            disableActive(this);
        });

        $('#ellipse-styler .text').click(function() {
            if ($('#ellipse').val() === 'ellipse') {
                canvasManager.activateEllipse();
            } else {
                canvasManager.activateEmptyCircle();
            }
            destroyCrop();
            disableActive($('#ellipse-styler'));
            return false;
        });

        $('#line-styler').click(function() {
            if ($('#line').val() === 'line') {
                canvasManager.activateLine();
                $(this).find('.text').removeAttr('class').addClass('text').addClass('line');
            } else {
                canvasManager.activateCurveLine();
                $(this).find('.text').removeAttr('class').addClass('text').addClass('line_curve');
            }
            destroyCrop();
            disableActive(this);
        });

        $('#line-styler .text').click(function() {
            if ($('#line').val() === 'line') {
                canvasManager.activateLine();
            } else {
                canvasManager.activateCurveLine();
            }
            destroyCrop();
            disableActive($('#line-styler'));
            return false;
        });

        $('#arrow-styler').click(function() {
            if ($('#arrow').val() === 'arrow') {
                canvasManager.activateArrow();
                $(this).find('.text').removeAttr('class').addClass('text').addClass('arrow1');
            } else {
                canvasManager.activateCurveArrow();
                $(this).find('.text').removeAttr('class').addClass('text').addClass('arrow_curve');
            }
            destroyCrop();
            disableActive(this);
        });

        $('#arrow-styler .text').click(function() {
            if ($('#arrow').val() === 'arrow') {
                canvasManager.activateArrow();
            } else {
                canvasManager.activateCurveArrow();
            }
            destroyCrop();
            disableActive($('#arrow-styler'));
            return false;
        });

        $('#inscription-styler').click(function() {
            if ($('#inscription').val() === 'sticker') {
                canvasManager.sticker();
                $(this).find('.text').removeAttr('class').addClass('text').addClass('sticker');
            } else {
                canvasManager.textArrow();
                $(this).find('.text').removeAttr('class').addClass('text').addClass('text_arrow');
            }
            destroyCrop();
            disableActive(this);
        });

        $('#inscription-styler .text').click(function() {
            if ($('#inscription').val() === 'sticker') {
                canvasManager.sticker();
            } else {
                canvasManager.textArrow();
            }
            destroyCrop();
            disableActive($('#inscription-styler'));
            return false;
        });

//        $("#sticker").click(function() {
//            canvasManager.sticker();
//            disableActive(this);
//        });
//
//        $("#text-arrow").click(function() {
//            canvasManager.textArrow();
//            disableActive(this);
//        });


        $("#text").click(function() {
            canvasManager.text();
            disableActive(this);
        });

        $('#line-width-styler').click(function(e) {
            canvasManager.changeStrokeSize($('#line-width').val());
            var clas = $(e.target).attr('class');
            if (clas !== undefined) {
                clas = clas.replace('selected sel', '');
                $(this).find('.text').removeAttr('class').addClass('text').addClass(clas);
            }
        });

        $('#colortools').change(function() {
            var c = $('#colortools').val();
            canvasManager.changeStrokeColor(c);
            $('#colortools-styler').find('.text').css('background-color', c);
        });

        $("#eraser").click(function() {
            canvasManager.activateEraser();
            disableActive(this);
        });

        $('#blur-styler').click(function() {
            if ($('#blur').val() === 'blur') {
                canvasManager.activateBlur();
                $(this).find('.text').removeAttr('class').addClass('text').addClass('blur');
            } else {
                canvasManager.activateBlurOther();
                $(this).find('.text').removeAttr('class').addClass('text').addClass('blur_all');
            }
            destroyCrop();
            disableActive(this);
        });

        $('#blur-styler .text').click(function() {
            if ($('#blur').val() === 'blur') {
                canvasManager.activateBlur();
            } else {
                canvasManager.activateBlurOther();
            }
            destroyCrop();
            disableActive($('#blur-styler'));
            return false;
        });

        $("#undo").click(function() {
            canvasManager.undo();
        });

        $("#undo-all").click(function() {
            canvasManager.undoAll();
            canvasManager.loadBackgroundImage(imgdata);
        });

        $("#redo").click(function() {
            canvasManager.redo();
        });

        $("#numbers").click(function() {
            if($(this).hasClass('enable')) {
                $(this).removeClass('enable');
                localStorage.enablenumbers = 'false';
                canvasManager.setEnableNumbers(false);
            } else {
                $(this).addClass('enable');
                localStorage.enablenumbers = 'true';
                canvasManager.setEnableNumbers(true);
            }

        });

        $("#crop").click(function() {

            disableActive(this);

            if (jcrop) {
                return true;
            }

            var pole = $('<div id="forcrop">').appendTo('#photo');
            var size = getSize();
            var zoom = canvasManager.getZoom();

            var position = $('#editcanva').offset();

            pole.css('width', size.w * zoom);
            pole.css('height', size.h * zoom);
            pole.css('position', 'absolute');
            pole.css('left', position.left + 'px');
            pole.css('top', position.top + 'px');

            var crop = $('<div>').appendTo(pole);

            crop.css('width', '100%');
            crop.css('height', '100%');
            crop.css('position', 'absolute');
            crop.css('left', '0px');
            crop.css('top', '0px');


            jcrop = $.Jcrop(crop, {
                keySupport: true,
                onSelect: createCoords,
                onChange: showCards,
                onMousemove: function (e) {
                    canvasManager.scrollPage(e);
                },
                onEnter: function (e) {
                    $("#crop-image").click();
                }
            });
        });

        $('#save-image').click(function() {

            var bgScreen = chrome.extension.getBackgroundPage().screenshot;
            bgScreen.download({
                url: $('#imgfordownload').attr('href'),
                pageinfo: pageinfo
            });
//            var url = imgnewdata.replace(/^data:image\/[^;]/, 'data:application/octet-stream');
//            window.open(url);

        });

        $('#save-nimbus, #nimbus-comment-upload').click(function() {

            nimbus.userExistsCookies(function() {
                nimbus.show();
            });
//            if (nimbus.user_authorized()) {
//                nimbus.notesGet();
//                nimbus.notesShare();
//                nimbus.uploadFile(pageinfo,imgnewdata);
//                nimbus.notesRemove();
//            } else {
//                nimbus.show();
//            }
        });
        $('#save-to-nimbus').click(function(){
            nimbus.startUpload(pageinfo, imgnewdata);
        });
        $('#my-uploads-nimbus').click(function(e){
            window.open('https://nimbus.everhelper.me/client/', '_blank');
            e.preventDefault();
        });
        $('#go-to-nimbus-pro').click(function(e){
            window.open('http://nimbus.everhelper.me/pricing.php', '_blank');
            e.preventDefault();
        });

        $('#send-to-google').click(function() {
            saveToGdrive();
            hidePopup();
        });

        $('#copy-to-clipboard').click(function() {
//            try {
//                if(saveToClipboard(imgnewdata)) {
//                    $.ambiance({message:  chrome.i18n.getMessage("notificationCopy")});
//                } else {
//                    throw 'problem with NPAPI';
//                }
//            } catch (e) {
//                $.ambiance({message: chrome.i18n.getMessage("notificationWrong"), type: "error", timeout: 2});
//            }
        });

        $('#print-img').click(function() {

            $('iframe#print').remove();
            var iframe = document.createElement('IFRAME');

            $(iframe).attr({
                style: 'position:absolute;width:0px;height:0px;left:-500px;top:-500px;',
                id: 'print'
            });
            document.body.appendChild(iframe);
            var imagediv = '<div style="margin:0 auto;text-align:center"><img src="' + imgnewdata + '"></div>';

            iframe.contentWindow.document.write(imagediv);
            var frameWindow = iframe.contentWindow;
            frameWindow.close();
            frameWindow.focus();
            window.setTimeout(function() {
                frameWindow.print();
            }, 500);

        });

        $('button.panel_btn').tipsy();
        (function () {
            $('#zoomplus').attr('original-title', chrome.i18n.getMessage("tooltipZoomPlus"));
            $('#zoomminus').attr('original-title', chrome.i18n.getMessage("tooltipZoomMinus"));
            $('#resize').attr('original-title', chrome.i18n.getMessage("tooltipResize"));
            $('#crop').attr('original-title', chrome.i18n.getMessage("tooltipCrop"));
            $('#pen').attr('original-title', chrome.i18n.getMessage("tooltipPen"));
            $('#text').attr('original-title', chrome.i18n.getMessage("tooltipText"));
            $('#undo').attr('original-title', chrome.i18n.getMessage("tooltipUndo"));
            $('#redo').attr('original-title', chrome.i18n.getMessage("tooltipRedo"));
            $('#undo-all').attr('original-title', chrome.i18n.getMessage("tooltipUndoAll"));
            $('#shadow').attr('original-title', chrome.i18n.getMessage("tooltipShadow"));
            $('#numbers').attr('original-title', chrome.i18n.getMessage("tooltipNumbers"));
        })();
        $('#percent-styler .select').attr('original-title', chrome.i18n.getMessage("tooltipZoom")).tipsy();
        $('#ellipse-styler .select').attr('original-title', chrome.i18n.getMessage("tooltipEllipse")).tipsy();
        $('#rectangle-styler .select').attr('original-title', chrome.i18n.getMessage("tooltipRectangle")).tipsy();
        $('#line-styler .select').attr('original-title', chrome.i18n.getMessage("tooltipLine")).tipsy();
        $('#arrow-styler .select').attr('original-title', chrome.i18n.getMessage("tooltipArrow")).tipsy();
        $('#line-width-styler .select').attr('original-title', chrome.i18n.getMessage("tooltipLineWidth")).tipsy();
        $('#colortools-styler .select').attr('original-title', chrome.i18n.getMessage("tooltipColor")).tipsy();
        $('#blur-styler .select').attr('original-title', chrome.i18n.getMessage("tooltipBlur")).tipsy();
        $('#inscription-styler .select').attr('original-title', chrome.i18n.getMessage("tooltipNote")).tipsy();
        $('#copy_URL').attr('original-title', chrome.i18n.getMessage("tooltipCopy")).tipsy();
        $('#short_URL').attr('original-title', chrome.i18n.getMessage("tooltipShortUrl")).tipsy();
        $('#send-to-google').attr('original-title', chrome.i18n.getMessage("tooltipNotAuthorized")).tipsy();
        $('#user-logout').attr('original-title', chrome.i18n.getMessage("tooltipLogout")).tipsy({gravity: 'w'});
        $('.drawing_tools .sp-replacer.sp-light').attr('original-title', chrome.i18n.getMessage("tooltipFill")).tipsy();

        $('.select').bind('click', function() {
            $(this).tipsy('hide');
        });

        $('#form-change-pass input').tipsy({trigger: 'focus', gravity: 'w'});
        $('#form-login input').tipsy({trigger: 'focus', gravity: 'w'});
        $('#form-register input').tipsy({trigger: 'focus', gravity: 'w'});
        $('#remind-password input').tipsy({trigger: 'focus', gravity: 'w'});

        $('#linked input').click(function() {
            $(this).select();
        });
    }

    var nimbusRate = {
        urls: {
            'opera' : {
                'feedback': 'https://fvdmedia.userecho.com/list/21580-nimbus-products/?category=7165',
                'review': 'https://addons.opera.com/extensions/details/nimbus-screen-capture/'
            }
        },
        ratePopup: $('#nimbus-rate'),
        getRateInfo: function() {
            var obj = {};
            var time = (new Date()).getTime();
            try {
                obj = JSON.parse(localStorage['nimbus_rate_info']);
            } catch (e) {
                obj = {install: time, show: true, lastshow: -Infinity};
                localStorage['nimbus_rate_info'] = JSON.stringify(obj);
            }
            return obj;
        },

        saveRateInfo: function(obj) {
            localStorage['nimbus_rate_info'] = JSON.stringify(obj);
        },

        disableRate: function() {
            var obj = this.getRateInfo();
            obj.show = false;
            this.saveRateInfo(obj);
        },

        detectBrowser: function() {
            var browser = $.browser;
            for (var i in this.urls) {
                if (browser[i]) {
                    this.ratePopup.find('.feedback').attr('href', this.urls[i].feedback);
                    this.ratePopup.find('.reviews').attr('href', this.urls[i].review);
                    break;
                }
            }
        },

        showMessage: function() {
            var obj = this.getRateInfo();
            var day = 24 * 60 * 60 * 1000;
            var now = Date.now();
            this.detectBrowser();

            if (obj.show) {
                if (now > (+obj.install + 3 * day)) {
                    if (now > (+obj.lastshow + +day)) {
                        setTimeout(function() {
                            nimbusRate.ratePopup.fadeIn();
                        }, 500);
                        this.saveRateInfo({install: obj.install, show: true, lastshow: now});
                    }
                }
            }
        }
    };
    nimbusRate.getRateInfo();

    var nimbusAccountPopup = (function () {
        var popup = $('#nimbus-account-popup ');
        var bind = function () {
            popup.unbind();
            popup.find('button.create_account').on('click', function (){
                popup.hide();
                nimbus.show();
            })
        };
        this.init = function (){
            if (!localStorage['showAccountPopup']) {
                bind();
                nimbus.userAuthState(function(res) {
                    if (res.errorCode !== 0 || !res.body || !res.body.authorized) {
                        popup.show();
                    }
                });
                localStorage['showAccountPopup'] = 'false';
            }
        };
        return this;
    })();

    $('#nimbus-rate').bind('click', function() {
        $(this).fadeOut();
    });
    $('#disable-rate-message').bind('click', function(e) {
        nimbusRate.disableRate();
        e.preventDefault();
    });

    function createCoords(c) {

        var btncancel = $('<button/>', {
            html: '<i class="cancel"></i><div class="name">Cancel</div>',
            'id': 'caancel-crop',
            'class': 'edit_btn cancel'
        });

        var btncrop = $('<button/>', {
            html: '<i class="save"></i><div class="name">Crop</div>',
            'id': 'crop-image',
            'class': 'edit_btn edit'
        });

        $('#screenshotsize').remove();
        $('#screenshotbutton').remove();

        $('.jcrop-dragbar').first().before('<div id="screenshotsize"></div>');
        $('.jcrop-dragbar').first().before('<div id="screenshotbutton" class="nimbus_screenshot_buttons crop_buttons"></div>');

        $('#screenshotbutton').append(btncrop).append(btncancel);

        btncancel.click(function() {
            destroyCrop();
        });

        btncrop.click(function() {
            destroyCrop();
            canvasManager.cropImage(c);
        });

        $('.edit_btn').hover(function() {
            $(".name", this).stop().animate({top: '35px', bottom: '0px'}, {queue: false, duration: 160});
        }, function() {
            $(".name", this).stop().animate({top: '47px', bottom: '0'}, {queue: false, duration: 160});
        });

        showCards(c);
    }


    function showCards(c) {
        var zoom = canvasManager.getZoom();
        $('#screenshotsize').html('<span>' + Math.round(c.w / zoom) + ' x ' + Math.round(c.h / zoom) + '</span>');
        var size = getSize();
        if ((c.h + c.y + 55) > size.h) {
            $('#screenshotbutton').css('bottom', '8px');
        }
    }

    var setPublicGdrive = function(fileId) {
        chrome.identity.getAuthToken({ 'interactive': true }, function(token) {
            var xhr = new XMLHttpRequest();
            xhr.open('POST', 'https://www.googleapis.com/drive/v2/files/' + fileId + '/permissions');
            xhr.setRequestHeader('Authorization', 'Bearer ' + token);
            xhr.setRequestHeader('Content-Type', 'application/json');

            var permission = {
                "role": "reader",
                "type": "anyone"
            };
            var body = JSON.stringify(permission);

            xhr.onreadystatechange = function() {
                if (this.readyState == 4) {

                }
            };

            xhr.send(body);
        });

    };

    var gFolders = {
        gAccessToken: '',
        fList: {},
        fParents: {},
        fCurrent: 'root',
        getUploadFolder: function () {
            return JSON.parse(localStorage['google_upload_folder'] || '{"id":"root","title":"Main folder"}');
        },
        setUploadFolder: function (folder) {
            localStorage['google_upload_folder'] = JSON.stringify(folder);
        },
        setAccessToken: function(t) {
            gFolders.gAccessToken = t;
        },
        addFolder: function(folder) {
            var f = $('<li>', {
                'html': '<img src="' + folder.iconLink + '"> ' + folder.title,
                'data-id': folder.id
            }).appendTo('#file_manager .folders');
            f.bind('click', function() {
                var cur = $(this).data('id');
                gFolders.fParents[cur] = gFolders.fCurrent;
                gFolders.getFolders(cur);
            });
        },
        setParent: function(folder) {
            $('#parent').html('');
            var p = $('<div>', {
                'html': '<img src="' + folder.iconLink + '"> ' + folder.title,
                'data-id': folder.id
            }).appendTo('#parent');
            p.bind('click', function() {
                gFolders.getFolders($(this).data('id'));
            });
        },
        setCurrent: function(folder) {
            $('#current').html('');
            $('<div>', {
                'html': '<img src="' + folder.iconLink + '"><span> ' + folder.title + '</span>',
                'data-id': folder.id
            }).appendTo('#current');
            var t = folder.title;
            $('#future_folder').text(chrome.i18n.getMessage("foldersLabel") + ' ' + t);

        },
        setRootFolder: function() {
            $('#parent').html('');
            var p = $('<div>', {
                'html': chrome.i18n.getMessage("gDriveMainFolder"),
                'data-id': 'root'
            }).appendTo('#parent');
            p.bind('click', function() {
                gFolders.getFolders($(this).data('id'));
            });
        },
        getFolderInfo: function(folderID, callback) {
            if (gFolders.fList[folderID] == undefined) {
                var xhr = new XMLHttpRequest();
                xhr.open('GET', "https://www.googleapis.com/drive/v2/files/" + folderID);
                xhr.setRequestHeader('Authorization', 'Bearer ' + gFolders.gAccessToken);
                xhr.setRequestHeader('Content-Type', 'application/json');

                xhr.onreadystatechange = function() {
                    if (this.readyState == 4) {
                        if (xhr.status == 200) {
                            var res = JSON.parse(this.response);
                            gFolders.fList[folderID] = res;
                            callback(res);
                        } else {
                            console.log('error');
                            clearGdriveData();
                        }
                    }
                };

                xhr.send(null);

            } else {
                callback(gFolders.fList[folderID]);
            }
        },
        getParentFolder: function(folder, callback) {
            if (gFolders.fParents[folder] == undefined) {
                var xhr = new XMLHttpRequest();
                xhr.open('GET', "https://www.googleapis.com/drive/v2/files/" + folder + "/parents");
                xhr.setRequestHeader('Authorization', 'Bearer ' + gFolders.gAccessToken);
                xhr.setRequestHeader('Content-Type', 'application/json');

                xhr.onreadystatechange = function() {
                    if (this.readyState == 4) {
                        if (xhr.status == 200) {
                            var res = JSON.parse(this.response);
                            if (res.items.length > 0) {
                                gFolders.fParents[folder] = res.items[0].id;
                                callback(res.items[0].id);
                            } else {
                                gFolders.setRootFolder();
                            }
                            $('#file_manager').show();
                        } else {
                            console.log('error');
                        }
                        $('#uploadimg').hide();
                    }
                };

                xhr.send(null);
            } else {
                callback(gFolders.fParents[folder]);
            }
        },
        getFolders: function(folder) {
            folder = folder || 'root';

            $('#file_manager').fadeIn("fast");
            $('#file_manager .folders').html('').addClass('loading_folders');

            gFolders.fCurrent = folder;
            gFolders.getParentFolder(folder, function(id) {
                gFolders.getFolderInfo(id, function(info) {
                    gFolders.setParent(info);
                });
            });

            gFolders.getFolderInfo(folder, function(info) {
                gFolders.setCurrent(info);
            });

            var xhr = new XMLHttpRequest();
            xhr.open('GET', "https://www.googleapis.com/drive/v2/files/" + folder + "/children?q=mimeType = 'application/vnd.google-apps.folder'");
            xhr.setRequestHeader('Authorization', 'Bearer ' + gFolders.gAccessToken);
            xhr.setRequestHeader('Content-Type', 'application/json');

            xhr.onreadystatechange = function() {
                if (this.readyState == 4) {
                    if (xhr.status == 200) {
                        var res = JSON.parse(this.response);
                        var l = res.items.length;
                        if (l > 0) {
                            for (var i = l - 1; i >= 0; i--) {
                                gFolders.getFolderInfo(res.items[i].id, function(info) {
                                    gFolders.addFolder(info);
                                })
                            }
                        } else {
                            $('#file_manager .folders').append('<span>'+chrome.i18n.getMessage("gDriveNoItems")+'</span>');
                        }
                    } else {
                        console.log('error');
                    }
                    $('#file_manager .folders').removeClass('loading_folders');
                }
            };

            xhr.send(null);
        }
    };

    function hidePopup() {
        $('#select_folder').hide();
        $('#send-to-google').removeClass('active');
        $('#choose-folder').removeClass('active');
        $('body').unbind('click', hidePopup);
        if (authorized) setUploadFolderTooltip();
    }

    function setUploadFolderTooltip (title) {
        $('#send-to-google').attr('original-title', chrome.i18n.getMessage("tooltipUploadTo") + ': ' + (title || gFolders.getUploadFolder().title));
    }

    function setFolder(title) {
        $('#select_folder').find('span.title').html('<img src="https://ssl.gstatic.com/docs/doclist/images/icon_11_collection_list.png"> ' + title);
    }

    $('#btn_select').bind('click', function() {
        var info = {id: $('#current').find('div').data('id'), title: $('#current').find('span').text()};
        gFolders.setUploadFolder(info);
        setUploadFolderTooltip(info.title);
        $('#file_manager').fadeOut("fast");
    });

    $('.btn_cancel').bind('click', function() {
        $('.popup_bg').fadeOut("fast");
    });

    $('.popup_bg').bind('click', function(e) {
        if (e.target == this) {
            $('.popup_bg').fadeOut("fast");
        }
    });

    $('#choose-folder').bind('click', function() {
        var s = $('#select_folder');
        if (!s.is(':visible')) {
            setFolder(gFolders.getUploadFolder().title);
            $('#select_folder input[name=share]').prop('checked', localStorage['shareOnGoogle'] !== 'true')
            s.show();
            $('#send-to-google').addClass('active');
            $('#send-to-google').attr('original-title', '');
            $('#choose-folder').addClass('active');
            setTimeout(function() {
                $('body').bind('click', hidePopup);
            }, 10);
        }

    });

    $('.panel_settings').bind('click', function(e) {
//        e.preventDefault();
        e.stopPropagation();
//        return false;
    });

    $('#select_folder span.title').bind('click', function() {
        chrome.identity.getAuthToken({ 'interactive': true }, function(token) {
            gFolders.setAccessToken(token);
            gFolders.getFolders(gFolders.getUploadFolder().id);
            hidePopup();
        });
        return false;
    });

    $('#select_folder input[name=share]').on('change', function () {
        localStorage['shareOnGoogle'] = !$(this).prop('checked');
    });

    $('#nimbus-add-comments').click(function(e) {
        $('#nimbus-comment').slideToggle('fast').find('textarea').focus();
        e.preventDefault();
    });

    $('#nimbus_folder').click(function(e) {
        nimbus.foldersShowManager();
        e.preventDefault();
    });

    $('#nimbus-btn-select').bind('click', function() {
        $('.popup_bg').fadeOut("fast");

        var nff = $('#nimbus-future_folder');
        var cur = {id: nff.data('f-id'), title: nff.data('f-title')};
        nimbus.uploadSetFolder(cur);

        $('#save-nimbus').attr('original-title', chrome.i18n.getMessage("tooltipUploadTo") + ': ' + nimbus.uploadReadFolder().title);
    });

    $('#choose-nimbus-share').bind('click', function() {
        var s = $('#select-nimbus-setting');
        if (!s.is(':visible')) {
            $('#nimbus-user-email').text(decodeURIComponent(nimbus.user_email));
            $('#nimbus-folder').text(nimbus.uploadReadFolder().title);
            s.show();
            $('#save-nimbus').attr('original-title', '');
            $('#save-nimbus').addClass('active');
            $('#choose-nimbus-share').addClass('active');
            setTimeout(function() {
                $('body').bind('click', hidePopupNimbusShare);
            }, 10);
        }

    });


    var clearGdriveData = function() {
        chrome.identity.getAuthToken({ 'interactive': false }, function(current_token) {
            chrome.identity.removeCachedAuthToken({ token: current_token }, function() {});
        });
    };

    var saveToGdrive = function() {

        chrome.identity.getAuthToken({ 'interactive': true }, function(token) {

            if(typeof token === 'undefined') {
                return;
            }

            if (!authorized) {
                $('#choose-folder').show();
                setUploadFolderTooltip();
                authorized = true;
                return;
            }

            $('#message').hide();
            $('#linked').hide();
            $('#uploadimg').show();

            var format = localStorage.format || 'png';
            var data = imgnewdata.replace(/^data:image\/(png|jpeg|bmp);base64,/, "");

            var xhr = new XMLHttpRequest();
            xhr.open('POST', 'https://www.googleapis.com/upload/drive/v2/files?uploadType=multipart');
            xhr.setRequestHeader('Authorization', 'Bearer ' + token);
            xhr.setRequestHeader('Content-Type', 'multipart/mixed; boundary="--287032381131322"');

            xhr.onreadystatechange = function() {
                if (this.readyState == 4) {
                    $('#uploadimg').hide();

                    switch (xhr.status) {
                        case 200:	// success
                            var res = JSON.parse(xhr.response);
                            if (res.alternateLink && res.ownerNames) {
                                if(localStorage['shareOnGoogle'] === 'true') setPublicGdrive(res.id);
                                $('#linked').show();
                                $('#linked input').val(res.alternateLink);
                                copyUrlToClipboard(res.alternateLink)
                            }
                            break;

                        case 401: // login fail
                            $.ambiance({message: chrome.i18n.getMessage("notificationLoginFail"), type: "error", timeout: 2});
                            clearGdriveData();
                            break;

                        default: 	// network error
                            $.ambiance({message: chrome.i18n.getMessage("notificationWrong"), type: "error", timeout: 2});
                            clearGdriveData();
                    }

                    xhr = null;
                }
            };

            const boundary = '--287032381131322';
            const delimiter = "\r\n--" + boundary + "\r\n";
            const close_delim = "\r\n--" + boundary + "--";

            var metadata = {
                "title": screenname + "." + format,
                "mimeType": "image/" + format,
                "description": "Uploaded by Nimbus Screen Capture",
                "parents": [
                    {
                        "kind": "drive#fileLink",
                        "id": gFolders.getUploadFolder().id
                    }
                ]
            };

            var multipartRequestBody = delimiter + 'Content-Type: application/json\r\n\r\n' + JSON.stringify(metadata) + delimiter + 'Content-Type: ' + 'image/' + format + '\r\n' + 'Content-Transfer-Encoding: base64\r\n' + '\r\n' + data + close_delim;

            xhr.send(multipartRequestBody);

        });

    };

    $("#copy_URL").click(function() {
        copyUrlToClipboard();
    });

    $("#short_URL").click(function() {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://nimb.ws/dantist_api.php', true);
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xhr.onload = function() {
            //alert(this.responseText);
            var obj = jQuery.parseJSON(this.responseText);
            $('#linked input').val(obj.short_url);
            copyUrlToClipboard(obj.short_url);
        };
        xhr.send('url=' + encodeURIComponent($('#linked input').val()));
    });

    image.load(function() {
        initPage();
    });
    image.attr('src', imgdata);

});