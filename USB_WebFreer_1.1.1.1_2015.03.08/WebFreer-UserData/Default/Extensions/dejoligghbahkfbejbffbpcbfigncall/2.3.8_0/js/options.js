(function() {
  this.UglifyJS_NoUnsafeEval = true;

  $script('lib/angular-loader/angular-loader.min.js', 'angular-loader');

  $script('lib/jquery/jquery.min.js', 'jquery');

  $script('js/omega_pac.min.js', 'omega-pac');

  $script('lib/FileSaver/FileSaver.js', 'filesaver');

  $script('lib/blob/Blob.js', 'blob');

  $script('lib/spin.js/spin.js', function() {
    return $script('lib/ladda/ladda.min.js', function() {
      return $script.ready(['angular-loader'], function() {
        return $script('lib/angular-ladda/angular-ladda.min.js', 'angular-ladda');
      });
    });
  });

  $script.ready(['angular-loader'], function() {
    var lang, lang1, locale, locales, _ref;
    angular.module('omega', ['ngLocale', 'ngAnimate', 'ngSanitize', 'ui.bootstrap', 'ui.router', 'ngProgress', 'ui.sortable', 'angularSpectrumColorpicker', 'ui.validate', 'angular-ladda', 'omegaTarget', 'omegaDecoration']);
    $script.ready(['omega-pac'], function() {
      return $script('js/omega.js', 'omega');
    });
    locales = {
      '': 'en-us',
      'en': 'en-us',
      'zh': 'zh-cn',
      'zh-hans': 'zh-cn',
      'zh-hant': 'zh-tw',
      'zh-cn': 'zh-cn',
      'zh-hk': 'zh-hk',
      'zh-tw': 'zh-tw'
    };
    lang = navigator.language;
    lang1 = ((_ref = navigator.language) != null ? _ref.split('-')[0] : void 0) || '';
    locale = locales[lang] || locales[lang1] || locales[''];
    return $script(['js/omega_target_web.js', 'js/omega_decoration.js', 'lib/angular-animate/angular-animate.min.js', 'lib/angular-bootstrap/ui-bootstrap-tpls.min.js', 'lib/angular-i18n/angular-locale_' + locale + '.js', 'lib/ngprogress/ngProgress.min.js', 'lib/angular-ui-sortable/sortable.min.js', 'lib/angular-ui-utils/validate.min.js', 'lib/jsondiffpatch/jsondiffpatch.min.js', 'lib/angular-spectrum-colorpicker/angular-spectrum-colorpicker.min.js'], 'omega-deps');
  });

  $script.ready(['jquery'], function() {
    $script('lib/jquery-ui-1.10.4.custom.min.js', 'jquery-ui');
    return $script('lib/spectrum/spectrum.js', 'spectrum');
  });

  $script.ready(['angular-loader', 'jquery'], function() {
    return $script('lib/angular/angular.min.js', 'angular');
  });

  $script.ready(['angular'], function() {
    $script('lib/angular-ui-router/angular-ui-router.js', 'angular-ui-router');
    return $script('lib/angular-sanitize/angular-sanitize.min.js', 'angular-sanitize');
  });

  $script.ready(['angular', 'omega', 'omega-deps', 'angular-ui-router', 'jquery-ui', 'spectrum', 'filesaver', 'blob', 'angular-ladda', 'angular-sanitize'], function() {
    return angular.bootstrap(document, ['omega']);
  });

}).call(this);
