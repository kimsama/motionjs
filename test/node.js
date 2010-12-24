var motion = require(__dirname + '/../lib/motion.js').motion,
    vows   = require('vows'),
    assert = require('assert');

vows.describe('Motion.js').addBatch({
  // Motion Sanity
  'When creating a motion object' : {
    topic : function() {
      return motion();
    },
    "call sites are sane" : function(err, obj) {
      assert.isNumber(motion.SERVER);
      assert.isNumber(motion.CLIENT);
      assert.isNumber(motion.OBSERVER);
      assert.isFunction(obj.on);
      assert.isFunction(obj.emit);
      assert.isFunction(obj.removeListener);
      assert.isFunction(obj.removeAllListeners);
      obj.ticker.stop();
    }
  },
  'When emitting events': {
    topic : function() {
      var m = motion();

      m.on('test', this.callback);
      m.emit('test', null,  { test : 'data'});
      m.ticker.stop();

    }, 'on/emit work as expected' : function(err, data) {
      assert.equal(data.test, 'data');
    }
  }
}).addBatch({
  // Shared networking
  'When a message is build with netMsg' : {
    topic : function() {
      var m = motion(motion.CLIENT, { debug : true });
      // 'sync' is a known-to-be-valid netMsg type
      return { m : m, msg : m.netMsg('sync', 'data') };
    },
    'the message should be valid' : function(err, data) {
      assert.equal(data.msg.type, 'motion');
      assert.equal(data.msg.motionType, 'sync');
      assert.equal(data.msg.sync, 'data');
      assert.isTrue(data.m.handle(data.msg));
    }
  },
  'When an invalid message is built with netMsg' : {
    topic : function() {
      var m = motion(motion.CLIENT, { debug : true });
      // 'tick' is a known-to-be-valid netMsg type
      return { m : m, msg : m.netMsg('non-existant-type', 'data') };
    },
    'motion.handle(netMsg) should return false' : function(err, data) {
      assert.isFalse(data.m.handle(data.msg));
    }
  }
}).addBatch({
  // Client Behavior
  'When a controller is updated' : {
    topic : function() {
      var m = motion(motion.CLIENT, {
            debug    : true,
            syncRate : 100
          }),
          c = m.controller('dummy', 10),
          cb = this.callback;
      m.ticker.start();
      
      // Simulate movement
      c.set({ x : 0 });
      
      setTimeout(function() {
        c.set({ x : 100});
      }, 40);

      m.on('sync', function(msg) {
        m.ticker.stop();
        cb(null, msg);
      });
    },
    'the updates should be pushed out in a group' : function(err, msg) {
      assert.isTrue(msg.actions.dummy.length >= 10);
    }
  }
}).addBatch({
  // Server Behavior
  'When a server is running' : {
    topic : function() {
      var s     = motion(motion.SERVER, { syncRate : 50 }),
          start = (new Date()).getTime(),
          cb    = this.callback;

      s.ticker.start();
      s.on('sync', function(msg) {
        cb(null, { start: start, msg : msg });
        s.ticker.stop();
      });
    },
    'snapshots are taken on an interval' : function(err, data) {
      assert.isTrue(data.start + 50 <= (new Date()).getTime());
    }
  }
}).export(module);
