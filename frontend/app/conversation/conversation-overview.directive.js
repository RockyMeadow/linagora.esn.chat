(function() {
  /*eslint strict: [2, "function"]*/
  'use strict';

  angular
    .module('linagora.esn.chat')
    .directive('chatConversationOverview', chatConversationOverview);

  function chatConversationOverview() {
    var directive = {
      restrict: 'E',
      scope: {
        item: '=',
        channelState: '=?'
      },
      controller: 'ChatConversationItemController',
      controllerAs: 'vm',
      bindToController: true,
      templateUrl: '/chat/app/conversation/conversation-overview.html'
    };

    return directive;
  }
})();
