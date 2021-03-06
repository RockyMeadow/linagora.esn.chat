'use strict';

const constants = require('./constants');

module.exports = function(dependencies) {

  const models = {
    conversation: require('./db/conversation')(dependencies),
    message: require('./db/message')(dependencies)
  };

  const utils = require('./utils')(dependencies);
  const message = require('./message')(dependencies);
  const conversation = require('./conversation')(dependencies);
  const collaboration = require('./collaboration')(dependencies);
  const members = require('./members')(dependencies);
  const userState = require('./user-state')(dependencies);
  const moderate = require('./moderate')(dependencies);
  const listener = require('./listener')(dependencies);
  const search = require('./search')(dependencies);

  function start(callback) {
    listener.start({conversation, message});
    userState.init();
    moderate.start();
    search.init();
    callback();
  }

  return {
    collaboration,
    constants,
    conversation,
    listener,
    members,
    message,
    moderate,
    models,
    start,
    userState,
    utils
  };
};
