(function() {
  /*eslint strict: [2, "function"]*/
  'use strict';

  angular
    .module('linagora.esn.chat')
    .directive('chatMessagesView', chatMessagesViewDirective);

  chatMessagesViewDirective.$inject = ['chatConversationsService'];

  function chatMessagesViewDirective(chatConversationsService) {
    var directive = {
      restrict: 'E',
      scope: {
        conversation: '=',
        messages: '=',
        loadPreviousMessages: '&'
      },
      templateUrl: '/chat/app/conversation/messages-view.html',
      link: link
    };

    return directive;

    function link(scope) {
      chatConversationsService.getConversationNamePromise.then(function(getConversationName) {
        scope.getConversationName = getConversationName;
      });
    }
  }
})();
