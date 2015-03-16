(function() {
  var Log, OmegaTargetCurrent, Promise, actionForUrl, charCodeUnderscore, dispName, drawIcon, encodeError, external, iconCache, isHidden, options, state, storage, sync, syncStorage, tabs, timeout, unhandledPromises, unhandledPromisesId, unhandledPromisesNextId,
    __slice = [].slice,
    __hasProp = {}.hasOwnProperty;

  OmegaTargetCurrent = Object.create(OmegaTargetChromium);

  Promise = OmegaTargetCurrent.Promise;

  Promise.longStackTraces();

  OmegaTargetCurrent.Log = Object.create(OmegaTargetCurrent.Log);

  Log = OmegaTargetCurrent.Log;

  Log.log = function() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    console.log.apply(console, args);
    return localStorage['log'] += args.map(Log.str.bind(Log)).join(' ') + '\n';
  };

  Log.error = function() {
    var args, content;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    console.error.apply(console, args);
    content = args.map(Log.str.bind(Log)).join(' ');
    localStorage['logLastError'] = content;
    return localStorage['log'] += 'ERROR: ' + content + '\n';
  };

  unhandledPromises = [];

  unhandledPromisesId = [];

  unhandledPromisesNextId = 1;

  Promise.onPossiblyUnhandledRejection(function(reason, promise) {
    Log.error("[" + unhandledPromisesNextId + "] Unhandled rejection:\n", reason);
    unhandledPromises.push(promise);
    unhandledPromisesId.push(unhandledPromisesNextId);
    return unhandledPromisesNextId++;
  });

  Promise.onUnhandledRejectionHandled(function(promise) {
    var index;
    index = unhandledPromises.indexOf(promise);
    Log.log("[" + unhandledPromisesId[index] + "] Rejection handled!", promise);
    unhandledPromises.splice(index, 1);
    return unhandledPromisesId.splice(index, 1);
  });

  iconCache = {};

  drawIcon = function(resultColor, profileColor) {
    var cacheKey, ctx, ctx2x, icon;
    cacheKey = "omega+" + (resultColor != null ? resultColor : '') + "+" + profileColor;
    icon = iconCache[cacheKey];
    if (icon) {
      return icon;
    }
    ctx = document.getElementById('canvas-icon').getContext('2d');
    ctx2x = document.getElementById('canvas-icon-2x').getContext('2d');
    if (resultColor != null) {
      drawOmega(ctx, resultColor, profileColor);
      drawOmega2x(ctx2x, resultColor, profileColor);
    } else {
      drawOmega(ctx, profileColor);
      drawOmega2x(ctx2x, profileColor);
    }
    icon = {
      19: ctx.getImageData(0, 0, 19, 19),
      38: ctx2x.getImageData(0, 0, 38, 38)
    };
    return iconCache[cacheKey] = icon;
  };

  charCodeUnderscore = '_'.charCodeAt(0);

  isHidden = function(name) {
    return name.charCodeAt(0) === charCodeUnderscore && name.charCodeAt(1) === charCodeUnderscore;
  };

  dispName = function(name) {
    return chrome.i18n.getMessage('profile_' + name) || name;
  };

  actionForUrl = function(url) {
    return options.ready.then(function() {
      var request;
      request = OmegaPac.Conditions.requestFromUrl(url);
      return options.matchProfile(request);
    }).then(function(_arg) {
      var attached, condition, current, currentName, details, direct, icon, name, profile, profileColor, realCurrentName, result, resultColor, results, _i, _len, _ref, _ref1, _ref2, _ref3;
      profile = _arg.profile, results = _arg.results;
      current = options.currentProfile();
      currentName = dispName(current.name);
      if (current.profileType === 'VirtualProfile') {
        realCurrentName = current.defaultProfileName;
        currentName += " [" + (dispName(realCurrentName)) + "]";
        current = options.profile(realCurrentName);
      }
      details = '';
      direct = false;
      attached = false;
      for (_i = 0, _len = results.length; _i < _len; _i++) {
        result = results[_i];
        if (Array.isArray(result)) {
          if (result[1] == null) {
            attached = false;
            name = result[0];
            if (name[0] === '+') {
              name = name.substr(1);
            }
            if (isHidden(name)) {
              attached = true;
            } else if (name !== realCurrentName) {
              details += chrome.i18n.getMessage('browserAction_defaultRuleDetails');
              details += " => " + (dispName(name)) + "\n";
            }
          } else if (result[1].length === 0) {
            if (result[0] === 'DIRECT') {
              details += chrome.i18n.getMessage('browserAction_directResult');
              details += '\n';
              direct = true;
            } else {
              details += "" + result[0] + "\n";
            }
          } else if (typeof result[1] === 'string') {
            details += "" + result[1] + " => " + result[0] + "\n";
          } else {
            condition = (_ref = ((_ref1 = result[1].condition) != null ? _ref1 : result[1]).pattern) != null ? _ref : '';
            details += "" + condition + " => ";
            if (result[0] === 'DIRECT') {
              details += chrome.i18n.getMessage('browserAction_directResult');
              details += '\n';
              direct = true;
            } else {
              details += "" + result[0] + "\n";
            }
          }
        } else if (result.profileName) {
          if (result.isTempRule) {
            details += chrome.i18n.getMessage('browserAction_tempRulePrefix');
          } else if (attached) {
            details += chrome.i18n.getMessage('browserAction_attachedPrefix');
            attached = false;
          }
          condition = (_ref2 = (_ref3 = result.source) != null ? _ref3 : result.condition.pattern) != null ? _ref2 : result.condition.conditionType;
          details += "" + condition + " => " + (dispName(result.profileName)) + "\n";
        }
      }
      if (!details) {
        details = options.printProfile(current);
      }
      resultColor = profile.color;
      profileColor = current.color;
      icon = null;
      if (direct) {
        resultColor = options.profile('direct').color;
        profileColor = profile.color;
      } else if (profile.name === current.name && options.isCurrentProfileStatic()) {
        resultColor = profileColor = profile.color;
        icon = drawIcon(profile.color);
      } else {
        resultColor = profile.color;
        profileColor = current.color;
      }
      if (icon == null) {
        icon = drawIcon(resultColor, profileColor);
      }
      return {
        title: chrome.i18n.getMessage('browserAction_titleWithResult', [currentName, dispName(profile.name), details]),
        icon: icon,
        resultColor: resultColor,
        profileColor: profileColor
      };
    });
  };

  storage = new OmegaTargetCurrent.Storage(chrome.storage.local, 'local');

  state = new OmegaTargetCurrent.BrowserStorage(localStorage, 'omega.local.');

  syncStorage = new OmegaTargetCurrent.Storage(chrome.storage.sync, 'sync');

  sync = new OmegaTargetCurrent.OptionsSync(syncStorage);

  if (localStorage['omega.local.syncOptions'] !== '"sync"') {
    sync.enabled = false;
  }

  sync.transformValue = OmegaTargetCurrent.Options.transformValueForSync;

  options = new OmegaTargetCurrent.Options(null, storage, state, Log, sync);

  options.externalApi = new OmegaTargetCurrent.ExternalApi(options);

  options.externalApi.listen();

  if (chrome.runtime.id !== OmegaTargetCurrent.SwitchySharp.extId) {
    options.switchySharp = new OmegaTargetCurrent.SwitchySharp();
    options.switchySharp.monitor();
  }

  tabs = new OmegaTargetCurrent.ChromeTabs(actionForUrl);

  tabs.watch();

  options._inspect = new OmegaTargetCurrent.Inspect(function(url, tab) {
    if (url === tab.url) {
      options.clearBadge();
      tabs.processTab(tab);
      state.remove('inspectUrl');
      return;
    }
    state.set({
      inspectUrl: url
    });
    return actionForUrl(url).then(function(action) {
      var parsedUrl, title, urlDisp;
      parsedUrl = OmegaTargetCurrent.Url.parse(url);
      if (parsedUrl.hostname === OmegaTargetCurrent.Url.parse(tab.url).hostname) {
        urlDisp = parsedUrl.path;
      } else {
        urlDisp = parsedUrl.hostname;
      }
      title = chrome.i18n.getMessage('browserAction_titleInspect', urlDisp) + '\n';
      title += action.title;
      chrome.browserAction.setTitle({
        title: title,
        tabId: tab.id
      });
      return tabs.setTabBadge(tab, {
        text: '#',
        color: action.resultColor
      });
    });
  });

  options.setProxyNotControllable(null);

  timeout = null;

  options.watchProxyChange(function(details) {
    var internal, noRevert, notControllableBefore, parsed, reason;
    if (options.externalApi.disabled) {
      return;
    }
    if (!details) {
      return;
    }
    notControllableBefore = options.proxyNotControllable();
    internal = false;
    noRevert = false;
    switch (details['levelOfControl']) {
      case "controlled_by_other_extensions":
      case "not_controllable":
        reason = details['levelOfControl'] === 'not_controllable' ? 'policy' : 'app';
        options.setProxyNotControllable(reason);
        noRevert = true;
        break;
      default:
        options.setProxyNotControllable(null);
    }
    if (details['levelOfControl'] === 'controlled_by_this_extension') {
      internal = true;
      if (!notControllableBefore) {
        return;
      }
    }
    Log.log('external proxy: ', details);
    if (timeout != null) {
      clearTimeout(timeout);
    }
    parsed = null;
    timeout = setTimeout((function() {
      return options.setExternalProfile(parsed, {
        noRevert: noRevert,
        internal: internal
      });
    }), 500);
    parsed = options.parseExternalProfile(details);
  });

  external = false;

  options.currentProfileChanged = function(reason) {
    var current, currentName, details, icon, message, realCurrentName, title;
    iconCache = {};
    if (reason === 'external') {
      external = true;
    } else if (reason !== 'clearBadge') {
      external = false;
    }
    current = options.currentProfile();
    currentName = '';
    if (current) {
      currentName = dispName(current.name);
      if (current.profileType === 'VirtualProfile') {
        realCurrentName = current.defaultProfileName;
        currentName += " [" + (dispName(realCurrentName)) + "]";
        current = options.profile(realCurrentName);
      }
    }
    details = options.printProfile(current);
    if (currentName) {
      title = chrome.i18n.getMessage('browserAction_titleWithResult', [currentName, '', details]);
    } else {
      title = details;
    }
    if (external && current.profileType !== 'SystemProfile') {
      message = chrome.i18n.getMessage('browserAction_titleExternalProxy');
      title = message + '\n' + title;
      options.setBadge();
    }
    if (!current.name || !OmegaPac.Profiles.isInclusive(current)) {
      icon = drawIcon(current.color);
    } else {
      icon = drawIcon(options.profile('direct').color, current.color);
    }
    return tabs.resetAll({
      icon: icon,
      title: title
    });
  };

  encodeError = function(obj) {
    if (obj instanceof Error) {
      return {
        _error: 'error',
        name: obj.name,
        message: obj.message,
        stack: obj.stack,
        original: obj
      };
    } else {
      return obj;
    }
  };

  chrome.runtime.onMessage.addListener(function(request, sender, respond) {
    options.ready.then(function() {
      var method, promise, target;
      target = options;
      method = target[request.method];
      if (typeof method !== 'function') {
        Log.error("No such method " + request.method + "!");
        respond({
          error: {
            reason: 'noSuchMethod'
          }
        });
        return;
      }
      promise = Promise.resolve().then(function() {
        return method.apply(target, request.args);
      });
      if (request.noReply) {
        return;
      }
      promise.then(function(result) {
        var key, value;
        if (request.method === 'updateProfile') {
          for (key in result) {
            if (!__hasProp.call(result, key)) continue;
            value = result[key];
            result[key] = encodeError(value);
          }
        }
        return respond({
          result: result
        });
      });
      return promise["catch"](function(error) {
        Log.error(request.method + ' ==>', error);
        return respond({
          error: encodeError(error)
        });
      });
    });
    if (!request.noReply) {
      return true;
    }
  });

}).call(this);
