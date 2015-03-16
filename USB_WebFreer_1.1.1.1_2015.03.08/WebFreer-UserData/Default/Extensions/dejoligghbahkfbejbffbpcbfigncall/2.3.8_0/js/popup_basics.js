(function() {
  document.querySelector('.error-log').addEventListener('click', (function() {
    return window.OmegaTargetWebBasics.getLog(function(log) {
      var blob;
      blob = new Blob([log], {
        type: "text/plain;charset=utf-8"
      });
      return saveAs(blob, "OmegaLog_" + (Date.now()) + ".txt");
    });
  }), false);

  window.OmegaTargetWebBasics.getEnv(function(env) {
    var body, link, url;
    url = 'https://github.com/FelisCatus/SwitchyOmega/issues/new?title=&body=';
    body = window.OmegaTargetWebBasics.getMessage('popup_issueTemplate', [env.projectVersion, env.userAgent]);
    body || (body = "\n\n\n<!-- Please write your comment ABOVE this line. -->\nSwitchyOmega " + env.projectVersion + "\n" + env.userAgent);
    link = document.querySelector('.report-issue');
    link.href = url + encodeURIComponent(body);
    return window.OmegaTargetWebBasics.getError(function(err) {
      var final_url;
      if (!err) {
        return;
      }
      body += "\n```\n" + err + "\n```";
      final_url = url + encodeURIComponent(body);
      return link.href = final_url.substr(0, 2000);
    });
  });

}).call(this);
