(function() {
  window.OmegaTargetWebBasics = {
    getLog: function(callback) {
      return callback(localStorage['log'] || '');
    },
    getError: function(callback) {
      return callback(localStorage['logLastError'] || '');
    },
    getEnv: function(callback) {
      var extensionVersion;
      extensionVersion = chrome.runtime.getManifest().version;
      return callback({
        extensionVersion: extensionVersion,
        projectVersion: extensionVersion,
        userAgent: navigator.userAgent
      });
    },
    getMessage: chrome.i18n.getMessage.bind(chrome.i18n)
  };

}).call(this);
