var bg = chrome.extension.getBackgroundPage();
var bgScreencapture = bg.screenshot;
bg.onClassHas = 'impossibleClassAdd';
bg.onTabRealy = true;
bg.thisCrop = 'thisCrop';
bg.thisEr = true;

bgScreencapture.selectedOptionFunction(function() {
    var mainButtonBlock = $("#visible, #area, #window, #blank, #entire, #scroll");

    if (chrome.extension.getBackgroundPage().thisScrollEr == true) {
        if (chrome.extension.getBackgroundPage().onTabRealy) {
//            $("#scroll").removeClass("main_btn").addClass("activeB");
            mainButtonBlock.attr('disabled', 'disabled');
            $("#visible, #area, #window, #blank, #entire").css({backgroundPosition: '0px -70px', color: 'gray'});
        }
    }

    if (chrome.extension.getBackgroundPage().thisEr) {
//        $("#entire").removeClass("main_btn").addClass("activeB");
        mainButtonBlock.attr('disabled', 'disabled');
        $("#visible, #area, #window, #blank, #scroll").css({backgroundPosition: '0px -70px', color: 'gray'});

        if (chrome.extension.getBackgroundPage().onClassHas == 'impossibleClassAdd') {
            $("#window, #blank").removeAttr('disabled').css({backgroundPosition: '0px -35px', color: 'black'});
            $("#window, #blank").mouseover(function() {
                $(this).css({backgroundPosition: '0px -35px'});
            }).mouseout(function() {
                    $(this).css({backgroundPosition: '0px 0px'});
                });
        }

    }

    if (chrome.extension.getBackgroundPage().onTabRealy) {

        if (chrome.extension.getBackgroundPage().onClassHas == 'impossibleClassAdd') {
            $("#visible, #area, #entire, #scroll").css({backgroundPosition: '0px -70px', color: 'gray'});
        } else {
            $(".main_btn").css({backgroundPosition: '0px -70px', color: 'gray'});
            if (chrome.extension.getBackgroundPage().thisCrop == true) {
                $("#area").css({backgroundPosition: '0px -35px', color: 'black'});
                $(".main_btn").attr('disabled', 'disabled');
            }
        }
        return false;
    } else {
        $(".main_btn").mouseover(function() {
            $(this).css({backgroundPosition: '0px -35px'});
        }).mouseout(function() {
                $(this).css({backgroundPosition: '0px 0px'});
            });
    }

    if(localStorage.quickCapture !== 'false') {
        $("#" + localStorage.quickCapture).click();
    }
});

$(function() {
    (function setLocale() {
        $('h3').text(chrome.i18n.getMessage("popupTitle"));
        $("#visible span").text(chrome.i18n.getMessage("popupBtnVisible"));
        $("#area span").text(chrome.i18n.getMessage("popupBtnArea"));
        $("#scroll span").text(chrome.i18n.getMessage("popupBtnScroll"));
        $("#entire span").text(chrome.i18n.getMessage("popupBtnEntire"));
        $("#window span").text(chrome.i18n.getMessage("popupBtnWindow"));
        $("#blank span").text(chrome.i18n.getMessage("popupBtnBlank"));
        $("#android span").text(chrome.i18n.getMessage("popupBtnAndroid"));
        $("#options span").text(chrome.i18n.getMessage("popupBtnOptions"));
        $("#enableEdit option[value='edit']").text(chrome.i18n.getMessage("popupBtnEnableEdit"));
        $("#enableEdit option[value='save']").text(chrome.i18n.getMessage("popupBtnEnableDownload"));
        $("#enableEdit option[value='done']").text(chrome.i18n.getMessage("popupBtnEnableSave"));
        $("#enableEdit option[value='copy']").text(chrome.i18n.getMessage("popupBtnEnableCopy"));
    })();

    if (!bgScreencapture.detectOS()) {
        $("#window").hide();
    }

    $("#entire").click(function() {
        if (chrome.extension.getBackgroundPage().thisEr === true) {
            return false
        } else {
            bgScreencapture.captureEntire();
            window.close();
        }
    });

    $("#area").click(function() {
        if (chrome.extension.getBackgroundPage().onTabRealy) {
            return false;
        } else {
            bgScreencapture.captureSelected();
            window.close();
        }
    });

    $("#scroll").click(function() {
        if (chrome.extension.getBackgroundPage().onTabRealy) {
            return false;
        } else {
            bgScreencapture.scrollSelected();
            window.close();
        }
    });


    $("#visible").click(function() {
        if (chrome.extension.getBackgroundPage().onTabRealy) {
            return false;
        } else {
            bgScreencapture.captureVisible();
            window.close();
        }
    });


    $("#window").click(function() {
        if (chrome.extension.getBackgroundPage().onTabRealy) {
            if (chrome.extension.getBackgroundPage().onClassHas == 'impossibleClassAdd') {
                bgScreencapture.captureWindow();
                window.close();
            }
            return false;
        } else {
            bgScreencapture.captureWindow();
            window.close();
        }
    });

    $("#blank").click(function() {
        if (chrome.extension.getBackgroundPage().onTabRealy) {
            if (chrome.extension.getBackgroundPage().onClassHas == 'impossibleClassAdd') {
                bgScreencapture.createBlank();
                window.close();
            }
            return false;
        } else {
            bgScreencapture.createBlank();
            window.close();
        }
    });

    $("#android").click(function() {
        bgScreencapture.openPage('https://play.google.com/store/apps/details?id=com.fvd.nimbus');
        window.close();
    });

    $("#options").click(function() {
        chrome.tabs.create({url: 'options.html'}, function(tab) {
        });
    });

    if(!bgScreencapture.enableNpapi) $("#enableEdit option[value='copy']").remove();
    $("select#enableEdit")
        .val(localStorage.enableEdit)
        .bind("change click", function() {
            localStorage.enableEdit = $(this).val();
        });
});
