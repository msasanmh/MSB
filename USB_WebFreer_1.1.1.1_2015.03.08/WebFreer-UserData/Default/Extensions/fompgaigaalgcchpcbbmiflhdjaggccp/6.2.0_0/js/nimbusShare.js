var nimbus = {
    client_software: 'screens_chrome',
    user_session_id: '',
    user_email: '',
    user_auth: '',
    user_temp_pass: '',
    can_upload: true,
    img_size: 0,
    user_authorized: function() {
        return !!(nimbus.user_email && nimbus.user_session_id && nimbus.user_auth)
    },
    init: function() {

    },
    send: function(data, success, error) {

        $.ajax({
            type: 'POST',
            url: 'https://sync.everhelper.me',
            data: JSON.stringify(data),
            dataType: 'json',
            async: true,
            success: success,
            error: error
        });

    },
    userReadCookies: function(cb) {

        chrome.cookies.get({"url": 'https://everhelper.me', "name": 'auth_login'}, function(cookie) {
            nimbus.user_email = cookie ? cookie.value : undefined;
        });

        chrome.cookies.get({"url": 'https://everhelper.me', "name": 'eversessionid'}, function(cookie) {
            nimbus.user_session_id = cookie ? cookie.value : undefined;
        });

        chrome.cookies.get({"url": 'https://everhelper.me', "name": 'auth'}, function(cookie) {
            nimbus.user_auth = cookie ? cookie.value : undefined;
            if (typeof cb === 'function') cb();
        });

    },
    userReadSessionId: function() {
        return localStorage['screens_session_id'];
    },
    userSetSessionId: function(id) {
        nimbus.user_session_id = id;
        localStorage['screens_session_id'] = id;
    },
    userReadEmail: function() {
        return localStorage['screens_email'];
    },
    userSetEmail: function(email) {
        nimbus.user_email = email;
        localStorage['screens_email'] = email;
    },
    uploadReadFolder: function() {
        var obj = {};
        try {
            obj = JSON.parse(localStorage['screens_upload_folder_' + nimbus.user_email]);
        } catch (e) {
            obj = {id: 'default', title: 'My Notes'};
        }
        return obj;
    },
    uploadUpdateAndShowFolder: function() {
        var folder = nimbus.uploadReadFolder();
        var isset = false;
        nimbus.notesGetFolders(function(res) {
            if (res.errorCode === 0) {
                var l = res.body.notes.length;
                for (var i = l - 1; i >= 0; i--) {
                    if (res.body.notes[i].global_id == folder.id) {
                        isset = true;
                        break;
                    }
                }
                if (!isset) {
                    nimbus.uploadSetFolder({id: 'default', title: 'My Notes'});
                }
            } else {
                console.log('error');
            }
            nimbus.userShowFolder();
        });
    },
    uploadSetFolder: function(f) {
        localStorage['screens_upload_folder_' + nimbus.user_email] = JSON.stringify(f);
    },
    userAuth: function(email, password, callback) {

        this.send({
            "action": "user:auth",
            "body": {
                "email": email,
                "password": password
            },
            "_client_software": nimbus.client_software
        }, callback, callback);

    },
    userExistsCookies: function(callback) {
        var user = nimbus.user_auth, id = nimbus.user_session_id;
        nimbus.userReadCookies(function() {
            if (nimbus.user_auth === user && id === nimbus.user_session_id) {
                callback();
            } else {
                nimbus.show();
            }
        });

    },
    userExists: function(email, password, callback) {

        this.send({
            "action": "user_exists",
            "email": email,
            "password": password,
            "_client_software": nimbus.client_software
        }, callback, callback);

    },
    userRegister: function(email, password, callback) {

        this.send({
            "action": "user_register",
            "email": email,
            "password": password,
            "_client_software": nimbus.client_software
        }, callback, callback);

    },
    userChangePassword: function(email, password, newpassword, callback) {

        this.send({
            "action": "user_change_password",
            "newpassword": newpassword,
            "credentials": {
                "email": email,
                "password": password
            },
            "_client_software": nimbus.client_software
        }, callback, callback);

    },
    userChangePasswordConfirm: function(email, password, key, callback) {

        this.send({
            "action": "user_change_password_confirm",
            "key": key,
            "credentials": {
                "email": email,
                "password": password
            },
            "_client_software": nimbus.client_software
        }, callback, callback);

    },
    userRemindPassword: function(email, callback) {

        this.send({
            "action": "remind_password",
            "email": email,
            "_client_software": nimbus.client_software
        }, callback, callback);

    },
    userAuthState: function(callback) {
        this.send({
            "action": "user:authstate",
            "_client_software": nimbus.client_software
        }, callback, callback);
    },
    userLogin: function(email, pass, callback) {
        nimbus.userAuth(email, pass, function(res) {
            if (res.errorCode === 0) {
                nimbus.userSetEmail(encodeURIComponent(email));
                nimbus.userReadCookies();
                nimbus.showLimit();
                nimbus.hideAllPanel();
                nimbus.userShowEmail();
                nimbus.uploadUpdateAndShowFolder();
                nimbus.slide($('#nimbus-panel'));

//                    $('#choose-nimbus-share').show();
                $('#choose-nimbus-share').show();
                $('#save-nimbus').attr('original-title', '');
//                    $('#save-nimbus').attr('original-title', 'Upload to: ' + nimbus.uploadReadFolder().title);
            } else {
                callback();
                $.ambiance({message: chrome.i18n.getMessage("notificationLoginFail"), type: "error", timeout: 5});
            }
        });
    },
    userLogout: function() {
        //Производит очистку кук при авторизации через сайт, не принимает параметров.
        nimbus.user_session_id = '';
        nimbus.user_email = '';
        nimbus.user_auth = '';
        delete localStorage['screens_session_id'];
        delete localStorage['screens_email'];

        chrome.cookies.remove({"url": 'https://everhelper.me', "name": 'auth_login'});
        chrome.cookies.remove({"url": 'https://everhelper.me', "name": 'eversessionid'});
        chrome.cookies.remove({"url": 'https://everhelper.me', "name": 'auth'});

    },
    userInfo: function(callback) {
        this.send({
            "action": "user:info",
            "_client_software": nimbus.client_software
        }, callback, callback);
    },
    startUpload: function(pageinfo, imgnewdata) {
        if (nimbus.can_upload) {
            nimbus.userExistsCookies(function() {
                nimbus.uploadFile(pageinfo, imgnewdata);
                $('#user-panel').fadeOut('fast');
            });
        } else {
            $.ambiance({message: chrome.i18n.getMessage("notificationReachedLimit"), timeout: 5});
        }
    },
    screenSave: function(tempname) {
        var share = nimbus.notesIsShared();
        this.send({
            "action": "screenshots:save",
            "body": {
                "screen": {
                    "commentText": nimbus.notesGetComment(),
                    "tempname": tempname,
                    "parent_id": nimbus.uploadReadFolder().id
                },
                "share": share
            },
            "_client_software": nimbus.client_software

        }, function(msg) {
            if (msg.errorCode == '0') {
                if (share) {
                    $('#linked').show();
                    $('#url_button').show();
                    $('#linked input').val(msg.body.location);
                    copyUrlToClipboard(msg.body.location);
                } else {
                    $('#message').html('<a href="https://nimbus.everhelper.me/client/" target="_blank">' + chrome.i18n.getMessage("nimbusViewUploads") + '</a>').show();
                }
            } else {
                if (msg.errorCode == '-20') {
                    $.ambiance({message: chrome.i18n.getMessage("notificationReachedLimit"), type: "error", timeout: 5});
                } else {
                    $.ambiance({message: chrome.i18n.getMessage("notificationWrong"), type: "error", timeout: 5});
                }
            }
//            nimbus.notesGet();
        }, function(msg) {
            console.log(msg);

        });
    },
    setScreenSize: function(s) {
        nimbus.img_size = s;
    },
    notesGenerateId: function() {
        var chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        var string = '';
        var min = 0;
        var max = chars.length;

        for (var i = 0; i < 3; i++) {
            var n = Math.floor(Math.random() * (max - min)) + min;
            string += chars[n];
        }

        return string + (new Date()).getTime();
    },
    notesUpdate: function(pageinfo, tempname) {
        var notesId = nimbus.notesGenerateId();
        this.send({
            "action": "notes:update",
            "body": {
                "store": {
                    "notes": [
                        {
                            "global_id": notesId,
                            "parent_id": nimbus.uploadReadFolder().id,
                            "index": 1,
                            "type": "note",
                            "title": pageinfo.title,
                            "text": nimbus.notesGetComment(),
//                            "text": '<img src="http://habr.habrastorage.org/post_images/822/637/d27/822637d27e8d6fe1c384bd490cf261e6.png" alt="image">',
//                            "last_change_by": nimbus.client_software,
                            "url": pageinfo.url,
                            "tags": ["screens", "chrome"],
                            "attachements": [
                                {
                                    "global_id": nimbus.notesGenerateId(),
                                    "type": "image",
                                    "tempname": tempname
                                }
                            ]
                        }
                    ]
                }
            }
        }, function(msg) {
            if (nimbus.notesIsShared()) {
                nimbus.notesShare([notesId]);
            }
        }, function(error) {
            console.log(error);
        });

    },
    notesIsShared: function() {
        return !$("input#nimbus-share").prop('checked');
    },
    notesShare: function(id) {

        this.send({
            "action": "notes:share",
            "body": {
                "global_id": id
            }
        }, function(msg) {
            $('#linked').show();
            $('#url_button').show();
            $('#linked input').val(msg.body[id[0]]);

        }, function(error) {
            console.log(error);
        });

    },
    notesGet: function() {

        this.send({
            "action": "notes:get",
            "body": {
                "last_update_time": 1366090275 // время в формате UNIX timestamp в секундах
            }
        }, function(msg) {
            console.log(msg);
        }, function(error) {
            console.log(error);
        });

    },
    notesRemove: function() {
//
        this.send({
            "action": "notes:update",
            "body": {
                "remove": {
                    "notes": ["0d21377269151318"]
                }
            }
        }, function(msg) {
            console.log(msg);
            nimbus.notesGet();
        }, function(error) {
            console.log(error);
        });

    },
    notesGetComment: function() {
        return $('#nimbus-panel textarea').val();
//        if ($('#nimbus-comment').is(':visible')) {
//            return $('#nimbus-comment textarea').val();
//        }
//        return '';
    },
    uploadFile: function(pageinfo, data) {

        $('#message').hide();
        $('#linked').hide();
        $('#uploadimg').show();

        var format = localStorage.format || 'png'

        function dataURLtoBlob(dataURL) {
            var binary = atob(dataURL.split(',')[1]);
            var array = [];
            for (var i = 0; i < binary.length; i++) {
                array.push(binary.charCodeAt(i));
            }
            return new Blob([new Uint8Array(array)], {type: 'image/' + format});
        }

        var file = dataURLtoBlob(data);
//        var size= file.size;
        var fd = new FormData();
        fd.append("screens", file, ('screen.' + format));

        $.ajax({
            url: "https://sync.everhelper.me/files:preupload",
            type: "POST",
            data: fd,
            processData: false,
            contentType: false
        }).done(function(res) {
                if (res.errorCode === 0) {
                    nimbus.screenSave(res.body.files["screens"]);
                    $.ambiance({message: chrome.i18n.getMessage("notificationUploaded"), timeout: 5});
                } else {
                    $.ambiance({message: chrome.i18n.getMessage("notificationWrong"), type: "error", timeout: 5});
                }
                $('#uploadimg').hide();
            });

    },
    notesGetFolders: function(callback) {

        this.send({
            "action": "notes:getFolders",
            "body": {
            }
        }, function(msg) {
            callback(msg);
        }, function(error) {
            callback(error);
        });

    },
    foldersManagerAddFolder: function(folder) {
        var f = $('<li>', {
            'html': '<img src="images/icon_folder.png"> ' + folder.title,
            'data-id': folder.global_id
        }).appendTo('#nimbus_folders .folders');
        f.bind('click', function() {
            var cur = {id: folder.global_id, title: folder.title};
            nimbus.uploadSetFolder(cur);
            nimbus.userShowFolder();
        });
    },
    foldersManagerShowCurrent: function(cur) {
        $('#nimbus-future-folder').text(chrome.i18n.getMessage("foldersLabel") + ' ' + cur.title).data('f-title', cur.title).data('f-id', cur.id);
    },
    foldersHideManager: function() {
        $('#nimbus_folders').fadeOut('fast');
        $('body').unbind('click', nimbus.foldersHideManager);
        return false;
    },
    foldersShowManager: function() {
//        nimbus.foldersManagerShowCurrent(nimbus.uploadReadFolder());
        nimbus.userExistsCookies(function() {
            var nf = $('#nimbus_folders');
            if (nf.is(':visible')) {
                nimbus.foldersHideManager()
            } else {
                nf.fadeIn('fast').find('.folders').html('').addClass('loading_folders');
                setTimeout(function() {
                    $('body').bind('click', nimbus.foldersHideManager);
                }, 10);
                nimbus.notesGetFolders(function(res) {
                    if (res.errorCode === 0) {
                        var l = res.body.notes.length;
                        var h = l * 25 + 4;
                        nf.animate({height: (h < 128 ? h : 128) + "px"}, 300);
                        for (var i = l - 1; i >= 0; i--) {
                            nimbus.foldersManagerAddFolder(res.body.notes[i]);
                        }
                        var cur = nf.find('li[data-id=' + nimbus.uploadReadFolder().id + ']');
                        if (cur.length == 0) {
                            nimbus.uploadSetFolder({id: 'default', title: 'My Notes'});
                            nimbus.userShowFolder();
                            nf.find('li[data-id=default]').addClass('active');
                        } else {
                            cur.addClass('active');
                        }
                        nf.find('.folders').removeClass('loading_folders');
                    } else {
                        console.log('error');
                    }
                });
            }
        });
    },
    hideAllPanel: function() {
        $('#user-panel').find('.popup_content').hide();
    },
    userShowEmail: function() {
        $('span#user-email').text(decodeURIComponent(nimbus.user_email));
    },
    userShowFolder: function() {
        var folder = nimbus.uploadReadFolder();
        $('#nimbus-folder').html(folder.title);
        nimbus.foldersManagerShowCurrent(folder);
    },
    slide: function(element) {
        element.css({top: -440}).show();

        element.animate({
            top: 140
        }, 300);
    },
    showLimit: function() {
        function toMB(size, n) {
            return ((size) / 1024 / 1024).toFixed(n || 0) + ' MB';
        }

        nimbus.userInfo(function(msg) {
            if (msg.errorCode !== 0) return;

            var premium = !!msg.body.premium.active;
            var current = +msg.body.usage.notes.current;
            var max = +msg.body.usage.notes.max;
            var limitdiv = $('#nimbus-limit');

            limitdiv.find('progress').attr('value', current).attr('max', max);

            limitdiv.find('span').text(chrome.i18n.getMessage("limitUsage") + ' ' + toMB(current, 1) + ' ' + chrome.i18n.getMessage("limitOf") + ' ' + toMB(max));
            nimbus.can_upload = (current + nimbus.img_size) < max;

            if (nimbus.can_upload) {
                if (premium) {
                    $('#to-nimbus-pro').hide();
                } else {
                    $('#to-nimbus-pro').show();
                }
                $('#nimbus-pro').fadeOut('fast');
            } else {
                $('#nimbus-pro').fadeIn('fast');
            }
        });
    },
    show: function() {

        $('#nimbus-panel textarea').val($('#nimbus-comment').find('textarea').val());

        nimbus.hideAllPanel();

        nimbus.showLimit();
        nimbus.userAuthState(function(res) {
            if (res.errorCode === 0) {
                if (res.body && res.body.authorized) {

                    nimbus.userShowEmail();
                    nimbus.userShowFolder();
                    nimbus.uploadUpdateAndShowFolder();
                    $('#nimbus-panel').show();

                } else {
                    $('#login-panel').show();
                }
            } else {
                $('#login-panel').show();
            }
        });

//        if (nimbus.user_authorized()) {
//            nimbus.userShowEmail();
//            nimbus.userShowFolder();
//            nimbus.uploadUpdateAndShowFolder();
////            $('#authorized-panel').show();
//            $('#nimbus-panel').show();
//        } else {
//            $('#login-panel').show();
//        }

        $('#user-panel').fadeIn('fast');
    }
};

$(document).ready(function() {
    nimbus.userReadCookies();

    var formLogin = $('#form-login');
    formLogin.find('input').bind('keyup', function() {
        if ($(this).val().length < 1) {
            $(this).addClass('wrong');
        } else {
            $(this).removeClass('wrong');
            if ($(this).attr('name') === 'email') {
                $(this).attr('original-title', '').tipsy('hide');
                if (!/\S+@\S+\.\S+/.test($(this).val())) {
                    $(this).addClass('wrong');
                } else {
                    $(this).removeClass('wrong');
                }
            }

        }
    });
    formLogin.bind("submit", function() {
        var wrong = false;
        var email = this.elements['email'];
        var pass = this.elements['pass'];

        if (pass.value.length < 1) {
            $(pass).addClass('wrong').focus();
            wrong = true;
        }

        if (!/\S+@\S+\.\S+/.test(email.value)) {
            $(email).addClass('wrong').focus().attr('original-title', chrome.i18n.getMessage("tooltipWrongEmail")).tipsy('show');
            wrong = true;
        }

        if (!wrong) {
            nimbus.userLogin(email.value, pass.value, function() {

            });
        }

        return false;
    });

    var formRegister = $('#form-register');
    formRegister.find('input').bind('keyup', function() {

        if ($(this).val().length < 8) {
            $(this).addClass('wrong').attr('original-title', chrome.i18n.getMessage("tooltipPassInfo")).tipsy('show');
        } else {
            $(this).removeClass('wrong').attr('original-title', '').tipsy('hide');

            if ($(this).attr('name') === 'pass-repeat') {
                if ($(this).val() !== $('#form-register').find("[name='pass']").val()) {
                    $(this).addClass('wrong').attr('original-title', chrome.i18n.getMessage("tooltipPassMatch")).tipsy('show');
                } else {
                    $(this).removeClass('wrong').attr('original-title', '').tipsy('hide');
                }
            }
        }

        if ($(this).attr('name') === 'email') {
            $(this).attr('original-title', '').tipsy('hide');
            if (!/\S+@\S+\.\S+/.test($(this).val())) {
                $(this).addClass('wrong');
            } else {
                $(this).removeClass('wrong');
            }
        }
    });
    formRegister.bind("submit", function() {
        var wrong = false;
        var email = this.elements['email'];
        var pass = this.elements['pass'];
        var passRepeat = this.elements['pass-repeat'];

        if (pass.value !== passRepeat.value) {
            $(pass).addClass('wrong');
            $(passRepeat).addClass('wrong').focus();
            wrong = true;
        }
        if (pass.value.length < 8) {
            $(pass).addClass('wrong').focus();
            wrong = true;
        }

        if (!/\S+@\S+\.\S+/.test(email.value)) {
            $(email).addClass('wrong').focus().attr('original-title', chrome.i18n.getMessage("tooltipWrongEmail")).tipsy('show');
            wrong = true;
        }

        if (!wrong) {
            nimbus.userRegister(email.value, pass.value, function(res) {
                if (res.errorCode === 0) {
                    nimbus.userLogin(email.value, pass.value, function() {
                        nimbus.hideAllPanel();
                        nimbus.slide($('#login-panel'));
                    });
                } else if (res.errorCode === -4) {
                    $.ambiance({message: chrome.i18n.getMessage("notificationEmailFail"), type: "error", timeout: 5});
                } else {
                    $.ambiance({message: chrome.i18n.getMessage("notificationRegisterFail"), type: "error", timeout: 5});
                }
            });
        }
        return false;
    });

    var changePass = $('#form-change-pass');
    changePass.find('input').bind('keyup focus', function() {
        if ($(this).val().length < 8) {
            $(this).addClass('wrong').attr('original-title', chrome.i18n.getMessage("tooltipPassInfo")).tipsy('show');
        } else {
            $(this).removeClass('wrong').attr('original-title', '').tipsy('hide');

            if ($(this).attr('name') === 'new-pass-repeat') {
                if ($(this).val() !== $('#form-change-pass').find("[name='new-pass']").val()) {
                    $(this).addClass('wrong').attr('original-title', chrome.i18n.getMessage("tooltipPassMatch")).tipsy('show');
                } else {
                    $(this).removeClass('wrong').attr('original-title', '').tipsy('hide');
                }
            }
        }
    });
    changePass.bind("submit", function() {
        var wrong = false;
        var form = $('#form-change-pass');
        var pass = this.elements['pass'];
        var newPass = this.elements['new-pass'];
        var newPassRepeat = this.elements['new-pass-repeat'];


        if (newPass.value !== newPassRepeat.value) {
            $(newPass).addClass('wrong');
            $(newPassRepeat).addClass('wrong').focus();
            wrong = true;
        }
        if (newPass.value.length < 8) {
            $(newPass).addClass('wrong').focus();
            wrong = true;
        }
        if (pass.value.length < 1) {
            $(pass).addClass('wrong').focus();
            wrong = true;
        }

        if (!wrong) {
            nimbus.userChangePassword(nimbus.user_email, pass.value, newPass.value, function(res) {
                console.log(res);
                if (res.errorCode === 0) {
                    nimbus.user_temp_pass = pass;
                    nimbus.hideAllPanel();
                    nimbus.slide($('#confirm-change-pass-panel'));
                } else {
                    $('input[name="pass"]', form).addClass('wrong');
                    $.ambiance({message: chrome.i18n.getMessage("notificationDataIncorrect"), type: "error", timeout: 5});
                }
            });
        }

        return false;
    });

    $('#confirm-change-pass').bind("submit", function() {
        nimbus.userChangePasswordConfirm(nimbus.user_email, nimbus.user_temp_pass, this.elements['key'].value, function(res) {
            console.log(res);
            if (res.errorCode === 0) {
                $.ambiance({message: chrome.i18n.getMessage("notificationPassChanged"), timeout: 5});
                nimbus.user_temp_pass = '';
                nimbus.hideAllPanel();
                nimbus.slide($('#login-panel'));
            } else {
                $.ambiance({message: chrome.i18n.getMessage("notificationKeyIncorrect"), type: "error", timeout: 5});
            }
        });
        return false;
    });

    var remindPassword = $('#remind-password');
    remindPassword.find('input').bind('keyup', function() {
        if ($(this).val().length < 1) {
            $(this).addClass('wrong');
        } else {
            $(this).attr('original-title', '').tipsy('hide');
            if (!/\S+@\S+\.\S+/.test($(this).val())) {
                $(this).addClass('wrong');
            } else {
                $(this).removeClass('wrong');
            }
        }
    });
    remindPassword.bind("submit", function() {
        var wrong = false;
        var email = this.elements['email'];

        if (!/\S+@\S+\.\S+/.test(email.value)) {
            $(email).addClass('wrong').focus().attr('original-title', chrome.i18n.getMessage("tooltipWrongEmail")).tipsy('show');
            wrong = true;
        }

        if (!wrong) {
            nimbus.userRemindPassword(email.value, function(res) {
                console.log(res);
                if (res.errorCode === 0) {
                    $.ambiance({message: chrome.i18n.getMessage("notificationRestoreSent"), timeout: 5});
                    nimbus.hideAllPanel();
                    var lp = $('#login-panel');
                    lp.find('input[name="email"]').val(email.value);
                    lp.find('input[name="pass"]').val('');
                    nimbus.slide(lp);
                    lp.find('input[name="pass"]').focus();
                } else {
                    $.ambiance({message: chrome.i18n.getMessage("notificationEmailIncorrect"), type: "error", timeout: 5});
                }
            });
        }
        return false;
    });

    $('#user-logout').bind('click', function(e) {
        nimbus.userLogout();
//        $('#login-panel').show();
//        $('#authorized-panel').hide();
        $('#nimbus-panel').hide();
        nimbus.slide($('#login-panel'));

        $('#choose-nimbus-share').hide();
        $('#save-nimbus').attr('original-title', chrome.i18n.getMessage("tooltipNotAuthorized"));
        e.preventDefault();
    });

    $('#user-login').bind("click", function() {
    });

    $('#user-registration').bind("click", function() {
    });

    $('#user-flip-r, #user-flip-l').bind("click", function() {

        if ($('#login-panel').is(':visible')) {
            $('#login-panel').fadeOut("fast");
            nimbus.slide($('#register-panel'));
        } else {
            $('#register-panel').fadeOut("fast");
            nimbus.slide($('#login-panel'));
        }
        return false;
    });

    $('#change-pass').bind('click', function() {
        nimbus.hideAllPanel();
        nimbus.slide($('#change-pass-panel'));
        return false;
    });

    $('#back-to-authorized').bind('click', function() {
        nimbus.hideAllPanel();
        nimbus.slide($('#authorized-panel'));
        return false;
    });

    $('#forgot-pass').bind('click', function() {
        nimbus.hideAllPanel();
        nimbus.slide($('#remind-password-panel'));
        return false;
    });

    $('#remind-flip-login').bind('click', function() {
        nimbus.hideAllPanel();
        nimbus.slide($('#login-panel'));
        return false;
    });

    $('#remind-flip-register').bind('click', function() {
        nimbus.hideAllPanel();
        nimbus.slide($('#register-panel'));
        return false;
    });
//    $('#user-panel input').bind('keydown', function() {
//        $(this).removeClass('wrong')
//    });

});

