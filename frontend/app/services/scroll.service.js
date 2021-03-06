(function() {
  /*eslint strict: [2, "function"]*/
  /*eslint no-unused-vars: ["error", {"args": "after-used"}]*/
  'use strict';

  angular.module('linagora.esn.chat')
    .factory('chatScrollService', chatScrollService);

    chatScrollService.$inject = ['elementScrollService'];

    function chatScrollService(elementScrollService) {

      return {
        scrollDown: scrollDown
      };

      function scrollDown() {
        elementScrollService.autoScrollDown($('.ms-body .lv-body'));
      }
    }
})();
