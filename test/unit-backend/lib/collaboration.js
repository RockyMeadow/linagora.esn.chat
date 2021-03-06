'use strict';

var sinon = require('sinon');
var expect = require('chai').expect;
var CONSTANTS = require('../../../backend/lib/constants');
var CHANNEL_CREATION = CONSTANTS.NOTIFICATIONS.CHANNEL_CREATION;
var CONVERSATION_TYPE = CONSTANTS.CONVERSATION_TYPE;
var CONVERSATION_UPDATE = CONSTANTS.NOTIFICATIONS.CONVERSATION_UPDATE;
var CHANNEL_DELETION = CONSTANTS.NOTIFICATIONS.CHANNEL_DELETION;
var TOPIC_UPDATED = CONSTANTS.NOTIFICATIONS.TOPIC_UPDATED;
var ADD_MEMBERS_TO_CHANNEL = CONSTANTS.NOTIFICATIONS.MEMBER_ADDED_IN_CONVERSATION;

describe('The linagora.esn.chat collaboration lib', function() {

  var deps, lib, logger, err, user, channelCreationTopic, channelAddMember, modelsMock, ObjectIdMock, mq, channelTopicUpdateTopic, channelUpdateTopic, channelDeletionTopic, collaboration;

  function dependencies(name) {
    return deps[name];
  }

  beforeEach(function() {

    collaboration = {};
    user = {};
    err = null;

    channelCreationTopic = {
      publish: sinon.spy()
    };

    channelAddMember = {
      subscribe: sinon.spy(),
      publish: sinon.spy()
    };

    channelTopicUpdateTopic = {
      subscribe: sinon.spy(),
      publish: sinon.spy()
    };

    channelUpdateTopic = {
      subscribe: sinon.spy(),
      publish: sinon.spy()
    };

    channelDeletionTopic = {
      subscribe: sinon.spy(),
      publish: sinon.spy()
    };

    logger = {
      error: console.log,
      info: console.log,
      debug: console.log
    };

    mq = {
      populate: sinon.spy(function() {
        return mq;
      }),
      exec: sinon.spy(function(cb) {
        cb();
      }),
      sort: sinon.spy(function(type, cb) {
        return mq;
      })
    };

    modelsMock = {
      ChatConversation: {
        find: sinon.spy(function(options, cb) {
          cb && cb();
          return mq;
        }),
        findById: sinon.spy(function(options, cb) {
          cb && cb();
          return mq;
        }),
        findByIdAndRemove: sinon.spy(function(channel, cb) {
          cb();
        }),
        findByIdAndUpdate: sinon.spy(function(id, action, cb) {
          cb && cb(null, mq);
          return mq;
        }),
        findOneAndUpdate: sinon.spy(function(query, action, cb) {
          cb && cb(null, mq);
          return mq;
        }),
        update: sinon.spy(function(query, action, cb) {
          cb && cb(null, mq);
        })
      }
    };

    ObjectIdMock = sinon.spy();

    deps = {
      logger: logger,
      db: {
        mongo: {
          mongoose: {
            model: function(type) {
              return modelsMock[type];
            },
            Types: {
              ObjectId: function() {
                return ObjectIdMock.apply(this, arguments);
              }
            }
          }
        }
      },
      collaboration: {
        queryOne: function(type, tuple, callback) {
          return callback(err, collaboration);
        }
      },
      user: {
        get: function(id, callback) {
          callback(null, user);
        }
      },
      pubsub: {
        global: {
          topic: function(name) {
            if (name === CHANNEL_CREATION) {
              return channelCreationTopic;
            }
            if (name === TOPIC_UPDATED) {
              return channelTopicUpdateTopic;
            }
            if (name === ADD_MEMBERS_TO_CHANNEL) {
              return channelAddMember;
            }
            if (name === CONVERSATION_UPDATE) {
              return channelUpdateTopic;
            }
            if (name === CHANNEL_DELETION) {
              return channelDeletionTopic;
            }
          }
        }
      }
    };

    lib = {
      utils: require('../../../backend/lib/utils')(dependencies),
      conversation: {
        markAllAsRead: function(user, conversation, callback) {
          callback(null, conversation);
        }
      }
    };
  });

  describe('The getConversation function', function() {
    it('should call ChatConversation.findOne with the correct parameters', function(done) {
      var tuple = {id: 'id', objectType: 'community'};
      var callback = 'callback';

      var exec = function(_callback_) {
        expect(modelsMock.ChatConversation.findOne).to.have.been.calledWith({
          type: CONVERSATION_TYPE.COLLABORATION,
          collaboration: tuple
        });

        expect(_callback_).to.be.equals(callback);
        done();
      };

      modelsMock.ChatConversation.findOne = sinon.stub().returns({exec: exec});

      require('../../../backend/lib/collaboration')(dependencies, lib).getConversation(tuple, callback);

    });
  });

  describe('The getMembers function', function() {
    const collaborationTuple = {id: 1, objectType: 'community'};

    it('should reject when getCollaboration fails', function(done) {
      err = new Error();

      require('../../../backend/lib/collaboration')(dependencies, lib).getMembers({collaboration: collaborationTuple}).then(function() {
        done(new Error('Should not occur'));
      }, function(err) {
        expect(err.message).to.match(/Error while getting collaboration from conversation/);
        done();
      });
    });

    it('should reject when collaboration is not found', function(done) {
      collaboration = null;

      require('../../../backend/lib/collaboration')(dependencies, lib).getMembers({collaboration: collaborationTuple}).then(function() {
        done(new Error('Should not occur'));
      }, function(err) {
        expect(err.message).to.match(/Can not find collaboration from conversation/);
        done();
      });
    });

    it('should return only user members who joined', function(done) {
      user = {id: 1, objectType: 'user'};

      collaboration = {
        members: [
          {member: user, status: 'joined'},
          {member: {objectType: 'notuser'}, status: 'joined'},
          {member: {id: 2, objectType: 'user'}, status: 'notjoined'}
        ]
      };

      require('../../../backend/lib/collaboration')(dependencies, lib).getMembers({collaboration: collaborationTuple}).then(function(members) {
        expect(members).to.shallowDeepEqual([user]);
        done();
      }, done);
    });
  });
});
