(function() {
  $script('lib/tether/tether.js', function() {
    return $script('lib/shepherd.js/shepherd.min.js', function() {
      var conditionTypeStep, tour, tr, _ref;
      tr = chrome.i18n.getMessage.bind(chrome.i18n);
      tour = new Shepherd.Tour({
        defaults: {
          classes: 'shepherd-theme-arrows',
          scrollTo: true
        }
      });
      tour.addStep('condition-step', {
        text: tr('options_guide_conditionStep'),
        attachTo: '.switch-rule-row bottom',
        scrollTo: true,
        buttons: [
          {
            text: tr('options_guideSkip'),
            action: tour.cancel,
            classes: 'shepherd-button-secondary'
          }, {
            text: tr('options_guideNext'),
            action: tour.next
          }
        ]
      });
      conditionTypeStep = tour.addStep('condition-type-step', {
        text: tr('options_guide_conditionTypeStep'),
        attachTo: '.condition-type-th bottom',
        advanceOn: {
          selector: '.close-condition-help',
          event: 'click'
        },
        scrollTo: true,
        buttons: [
          {
            text: tr('options_guideNext'),
            action: tour.next
          }
        ]
      });
      conditionTypeStep.on('show', function() {
        return jQuery('.toggle-condition-help').one('click', function() {
          if (!conditionTypeStep.isOpen()) {
            return;
          }
          jQuery('.shepherd-step.shepherd-enabled').hide();
          return jQuery('.toggle-condition-help, .close-condition-help').one('click', function() {
            return tour.next();
          });
        });
      });
      tour.addStep('condition-profile-step', {
        text: tr('options_guide_conditionProfileStep'),
        attachTo: '.switch-rule-row-target bottom',
        scrollTo: true,
        buttons: [
          {
            text: tr('options_guideNext'),
            action: tour.next
          }
        ]
      });
      tour.addStep('switch-default-step', {
        text: tr('options_guide_switchDefaultStep'),
        attachTo: '.switch-default-row top',
        scrollTo: true,
        buttons: [
          {
            text: tr('options_guideNext'),
            action: tour.next
          }
        ]
      });
      tour.addStep('apply-switch-profile-step', {
        text: tr('options_guide_applySwitchProfileStep'),
        attachTo: 'body top',
        scrollTo: false,
        classes: 'shepherd-theme-arrows fixed-top-right',
        buttons: [
          {
            text: tr('options_guideDone'),
            action: tour.next
          }
        ]
      });
      if ((_ref = Shepherd.activeTour) != null) {
        _ref.cancel();
      }
      return tour.start();
    });
  });

}).call(this);
