var motion = require(__dirname + '/../lib/motion.js').motion,
    vows   = require('vows'),
    assert = require('assert');

vows.describe('Motion.js').addBatch({
  // Motion Sanity
  'Sanity' : {
    topic : function() {
      return motion();
    },
    "call sites are sane" : function(err, motion) {
      assert.isFunction(motion.setMode);
      assert.isNumber(motion.SERVER);
      assert.isNumber(motion.CLIENT);

      assert.isSame(motion.setMode(motion.SERVER), motion);


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
