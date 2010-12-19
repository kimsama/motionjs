var Motion = require(__dirname + '/../lib/motion.js').Motion;
    vows   = require('vows'),
    assert = require('assert');

vows.describe('Data model').addBatch({
  'When creating a new Motion object and setting it\'s interval' : {
    topic : function() {
      var motion = new Motion(),
          self = this;

      this.start = (new Date()).getTime(),

      motion.snapshot_timeout = 100;
      motion.snapshotActions.push(function() {
        self.callback(null, motion)
      });
      motion.start();
    },
    'snapshots are taken on an interval' : function(motion) {
      assert.isTrue((new Date()).getTime() - this.start >= 100);
      motion.stop();
    }
  },
  'When attempting to set a Motion value' : {
    topic : function() {
      var motion = new Motion();

      motion.validationSteps.push(function(name, value) {
        return name !== 'invalid';
      });
      return motion;
    },
    'validation controls whether or not the field is set' : function(motion) {
      assert.isFalse(motion.validate('invalid', true));

      motion.set('valid', 'valid');
      assert.strictEqual('valid', motion.get('valid'));

      motion.set('invalid', true);
      assert.strictEqual(null, motion.get('invalid'));
    }
  },
  'When changing values' : {
    topic : function() {
      var motion = new Motion();
      motion.set('diff1', true);
      return motion;
    },
    'they should be cached in a diff until the next snapshot' : function(motion) {
      assert.isTrue(motion.changes_since_last_snapshot.diff1);
      motion.snapshot();
      assert.typeOf(motion.changes_since_last_snapshot.diff1, 'undefined');
    }
  },
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

}).export(module);
