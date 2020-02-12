/* global TrelloPowerUp */

var t = TrelloPowerUp.iframe();

// you can access arguments passed to your iframe like so
var arg = t.arg('arg');

var settingValuesDiv = document.getElementById('settingValues');


function httpGet(url) {
  return new Promise((resolve, reject) => {
    http.get('https://test-api.configcat.com/' + url, response => {
      response.setEncoding('utf8');
      response.pipe(bl((err, data) => {
        if (err) {
          reject(err);
        }
        resolve(data.toString());
      }));
    });
  });
}

t.render(function () {
  return t.get('card', 'shared', 'settings')
    .then(function (settings) {
      var settingValuesText = '';
      for (settingIndex = 0; settingIndex < settings.length; ++settingIndex) {
        var setting = settings[settingIndex];
        httpGet('api/v1/' + setting.environmentId + '/settings/' + setting.settingId + '/value')
          .then(function (settingValue) {
            var settingValueText = setting.name;

            if ((!settingValue.rolloutRules || settingValue.rolloutRules.length === 0)
              && (!settingValue.percentageRules || settingValue.percentageRules.length === 0)) {
              settingValueText = settingValueText + ' ➔ ' + settingValue.value;
            }
            else {
              if (settingValue.rolloutRules || settingValue.rolloutRules.length > 0) {
                for (rolloutRuleIndex = 0; rolloutRuleIndex < settingValue.rolloutRules.length; ++rolloutRuleIndex) {
                  var rolloutRule = settingValue.rolloutRules[rolloutRuleIndex];
                  var rolloutRuleText = '<br/>&nbsp;&nbsp;IF <' + rolloutRule.comparisonAttribute + '> ' + rolloutRule.comparator.toUpper()
                    + ' <' + rolloutRule.comparisonValue + '> THEN <' + rolloutRule.value + '>';
                  settingValueText = settingValueText + rolloutRuleText;
                }
              }

              if (settingValue.percentageRules || settingValue.percentageRules.length > 0) {
                for (percentageRuleIndex = 0; percentageRuleIndex < settingValue.percentageRules.length; ++percentageRuleIndex) {
                  var percentageRule = settingValue.percentageRules[percentageRuleIndex];
                  var percentageRuleText = '<br/>&nbsp;&nbsp;' + percentageRule.percentage + '% <' + percentageRule.value;
                  settingValueText = settingValueText + percentageRuleText;
                }
              }
            }

            settingValuesText = settingValuesText + '<br/><br/>' + settingValueText;
          });
      }

      settingValuesDiv.innerHtml = settingValuesText;
    })
    .then(function () {
      return t.sizeTo('#content');
    });
});
