'use strict';

var Installer = (function() {

  var throbberClassList = document.getElementById('throbber').classList;

  function showThrobber() {
    throbberClassList.add('visible');
  }

  function hideThrobber() {
    throbberClassList.remove('visible');
  }

  var mozApps = window.navigator.mozApps;

  var buttons = document.querySelectorAll('menu[type="toolbar"] button');
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', function(evt) {
      var url = evt.target.dataset.manifestUrl;

      if (mozApps) {
        showThrobber();

        var request = mozApps.install(url);

        request.onsuccess = function() {
          hideThrobber();
        };

        request.onerror = function() {
          hideThrobber();
          alert('Install failed, error: ' + this.error.name);
        };
      } else {
        window.open(url, '_blank');
      }
    });
  }

}());
