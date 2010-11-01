var motion = require(__dirname + '/../lib/motion.js');
    vows   = require('vows'),
    assert = require('assert');

vows.describe('Data model').addBatch({
  'when creating a new object with motion' : {
    topic : function() {
      var ctor = motion.extend({});
      return new ctor();
    },
    'the object contains a synchronization layer' : function(obj) {
      assert.isFunction(obj.sync);
    }
  }
}).export(module);
