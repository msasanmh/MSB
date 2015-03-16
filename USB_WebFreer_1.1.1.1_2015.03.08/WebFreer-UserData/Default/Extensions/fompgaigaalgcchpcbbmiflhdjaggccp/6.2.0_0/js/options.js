$(function() {
    var hotkeys = {};

    $('#format-setting').find('button').click(function() {
        $('#format-setting').find('.active').removeClass('active');
        $(this).addClass('active');
        localStorage.format = $(this).data('format');
        changeFormat(localStorage.format);
    });

    $("input#enablesaveas").bind("change click", function() {
        localStorage.enableSaveAs = $(this).prop("checked");
    });
    $("input#savecropposition").bind("change click", function() {
        localStorage.saveCropPosition = $(this).prop("checked");
    });
    $("input#hidefixedelements").bind("change click", function() {
        localStorage.hideFixedElements = $(this).prop("checked");
    });

    $("input#quality").bind("input change", function() {
        var q = $(this).val();
        localStorage.imageQuality = q;
        $('#quality-value span').text(q);
    });

    var qcType = $('#quick-capture #typeCapture');
    qcType.find('.visible').attr('original-title', chrome.i18n.getMessage("popupBtnVisible")).tipsy();
    qcType.find('.area').attr('original-title', chrome.i18n.getMessage("popupBtnArea")).tipsy();
    qcType.find('.scroll').attr('original-title', chrome.i18n.getMessage("popupBtnScroll")).tipsy();
    qcType.find('.entire').attr('original-title', chrome.i18n.getMessage("popupBtnEntire")).tipsy();
    qcType.find('.window').attr('original-title', chrome.i18n.getMessage("popupBtnWindow")).tipsy();
    qcType.find('.blank').attr('original-title', chrome.i18n.getMessage("popupBtnBlank")).tipsy();

    var qcEdit = $('#quick-capture #enableEdit');
    qcEdit.find('.edit').attr('original-title', chrome.i18n.getMessage("popupBtnEnableEdit")).tipsy();
    qcEdit.find('.done').attr('original-title', chrome.i18n.getMessage("popupBtnEnableSave")).tipsy();
    qcEdit.find('.save').attr('original-title', chrome.i18n.getMessage("popupBtnEnableDownload")).tipsy();
    qcEdit.find('.copy').attr('original-title', chrome.i18n.getMessage("popupBtnEnableCopy")).tipsy();

    var blocker = $('#quick-capture .blocker');

    var last = 'visible';
    $("input#enablequickcapture")
        .prop('checked', (localStorage.quickCapture !== 'false'))
        .bind("change", function() {
            if (!$(this).prop("checked")) {
                localStorage.quickCapture = 'false';
            } else {
                setTypeCapture(last);
            }

            toggleQC();
        });

    function toggleQC () {
        if (localStorage.quickCapture !== 'false') {
            blocker.hide();
        } else {
            blocker.show();
        }
    }
    toggleQC();

    function setTypeCapture(type) {
        if (typeof type == 'undefined') {
            type = localStorage.quickCapture;
        } else {
            localStorage.quickCapture = type;
            last = type;
        }
        qcType.find('.active').removeClass('active');
        qcType.find('button[data-type="' + type + '"]').addClass('active');
    }
    setTypeCapture();
    qcType.find('button').click(function() {
        setTypeCapture($(this).data('type'));
    });

    function setEnableEdit(type) {
        if (typeof type == 'undefined') {
            type = localStorage.enableEdit;
        } else {
            localStorage.enableEdit = type;
        }
        qcEdit.find('.active').removeClass('active');
        qcEdit.find('button[data-type="' + type + '"]').addClass('active');
    }
    setEnableEdit();
    qcEdit.find('button').click(function() {
        setEnableEdit($(this).data('type'));
    });


    function changeFormat(f) {
        if(f === 'jpeg') {
            setQuality(localStorage.imageQuality);
            $("input#quality").prop('disabled', false).parent().attr('original-title', "");
        } else {
            setQuality(100);
            $("input#quality").prop('disabled', true).parent().attr('original-title', "Only for JPG").tipsy({gravity: 's'});
        }
    }
    function setQuality (q) {
        $("input#quality").val(q);
        $('#quality-value span').text(q);
    }

    var loadValue = function() {
        setQuality(localStorage.imageQuality);
        if (localStorage.format) {
            $('#format-setting').find('.' + localStorage.format).addClass('active');
            changeFormat(localStorage.format);
        }

        $('#filenamepattern').val(localStorage.fileNamePattern);

        $("input#enablesaveas").prop('checked', (localStorage.enableSaveAs !== 'false'));
        $("input#savecropposition").prop('checked', (localStorage.saveCropPosition !== 'false'));
        $("input#hidefixedelements").prop('checked', (localStorage.hideFixedElements !== 'false'));

        if (localStorage.hotkeys) {
            hotkeys = JSON.parse(localStorage.hotkeys);
            $('#entire').val(hotkeys.entire);
            $('#selected').val(hotkeys.selected);
            $('#visible').val(hotkeys.visible);
            $('#window').val(hotkeys.window);
            $('#scroll').val(hotkeys.scroll);
        }
    };

    $('#filenamepattern').keyup(function(e){
        localStorage.fileNamePattern = this.value;
    });

    var checkDifferent = function(arr) {
        var l = arr.length;
        for (var i = 0; i < l - 1; i++) {
            for (var j = i + 1; j < l; j++) {
                if (arr[i] === arr[j])
                    return false;
            }
        }
        return true;
    };

    $('#visible, #selected, #entire, #window, #scroll').change(function() {
        var e = $('#entire').val();
        var s = $('#selected').val();
        var sc = $('#scroll').val();
        var v = $('#visible').val();
        var w = $('#window').val();

        if (checkDifferent([e, s, sc, v, w])) {
            localStorage.hotkeys = JSON.stringify({entire: e, selected: s, scroll: sc, visible: v, window: w});
        } else {
            loadValue();
        }
    });

    loadValue();


    if (!chrome.extension.getBackgroundPage().screenshot.detectOS()) {
        $('#window').val(64);
        hotkeys.window = 64;
        localStorage.hotkeys = JSON.stringify(hotkeys);
        $('#window-capture').hide();
        $('#typeCapture .window').remove();
        $('#enableEdit .copy').remove();

//        $("#quick-capture select[name='type_capture'] option[value='window']").remove();
//        $("#quick-capture select[name='save'] option[value='copy']").remove();
    }

    //TODO bug in Chrome 35 on Ubuntu
    if(/Linux/.test(window.navigator.platform) && /Chrome\/35/.test(window.navigator.userAgent)){
        $('#enable-save-as').hide();
    }
});