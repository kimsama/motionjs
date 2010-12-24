var motion = require(__dirname + '/../lib/motion.js').motion,
    vows   = require('vows'),
    assert = require('assert');

vows.describe('Motion.js').addBatch({
  // Motion Sanity
  'Sanity' : {
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
  'Events': {
    topic : function() {
      var m = motion();

      m.on('test', this.callback);
      m.emit('test', null,  { test : 'data'});
      m.ticker.stop();

    }, 'on/emit work as expected' : function(err, data) {
      assert.equal(data.test, 'data');
    }
  }
}/*,
// Client Behavior
{

  'When a snapshot is taken' : {
    topic : function() {
      var motion = new Motion(), self = this;

      motion.start();
      motion.set('name', 'new value');
      motion.send = function(type, data) {
        motion.stop();
        self.callback(null, type, data);
      }
    },
    'it should be sent immediately with the diff' : function(err, type, diff) {
      assert.equal(type, 'snapshot.diff');
      assert.equal(diff.name, 'new value');
    }
  }

},
// Server Behavior
{





}*/).export(module);
