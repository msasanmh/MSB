(function() {
  window.onerror = function(message, url, line, col, err) {
    var log;
    log = localStorage['log'] || '';
    if (err.stack) {
      log += err.stack + '\n\n';
    } else {
      log += "" + url + ":" + line + ":" + col + ":\t" + message + "\n\n";
    }
    localStorage['log'] = log;
  };

}).call(this);
