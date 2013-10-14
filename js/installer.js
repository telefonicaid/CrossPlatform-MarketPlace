'use strict';

var Installer = (function() {

  var mozApps = window.navigator.mozApps;

  var buttons = document.querySelectorAll('menu[type="toolbar"] button');
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', function(evt) {
      var url = evt.target.dataset.manifestUrl;

      if (mozApps) {
        var request = window.navigator.mozApps.install(url);

        request.onsuccess = function() {
          alert('Installation successful!');
          request.onsuccess = request.onerror = null;
        };

        request.onerror = function() {
          alert('Install failed, error: ' + this.error.name);
          request.onsuccess = request.onerror = null;
        };
      } else {
        window.open(url, '_blank');
      }
    });
  }

}());
