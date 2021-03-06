(function() {
  /*eslint strict: [2, "function"]*/
  'use strict';

  angular.module('linagora.esn.chat')
    .config(injectApplicationMenu);

  injectApplicationMenu.$inject = ['dynamicDirectiveServiceProvider'];

  function injectApplicationMenu(dynamicDirectiveServiceProvider) {
    var chatItem = new dynamicDirectiveServiceProvider.DynamicDirective(true, 'chat-application-menu', {priority: 35});

    dynamicDirectiveServiceProvider.addInjection('esn-application-menu', chatItem);
  }
})();
