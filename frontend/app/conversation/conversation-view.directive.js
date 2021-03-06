(function() {
  /*eslint strict: [2, "function"]*/
  'use strict';

  angular
    .module('linagora.esn.chat')
    .directive('chatConversationView', chatConversationView);

  function chatConversationView() {
    var directive = {
      restrict: 'E',
      controller: 'ChatConversationViewController',
      controllerAs: 'vm',
      bindToController: true,
      templateUrl: '/chat/app/conversation/conversation-view.html',
      scope: {
        displayTopic: '='
      }
    };

    return directive;
  }
})();
