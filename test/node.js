var motion = require("motion").motion,
    assert = require("assert"),
    ts  = exports;

ts.test_callsites = function(t) {
  t.ok(motion.models);
  t.finish();
};

ts.test_NetworkObject_pause = function(t) {
  motion.start();
  var m = motion(motion.SERVER);

  m.set({
    paused : true,
    rate   : 0,
    tick   : function() {
      assert.ok(false);
      motion.stop().free(m);
      t.finish();
    }
  });

  setTimeout(function() {
    assert.ok(true);
    motion.stop().free(m);
    t.finish();
  },50);
};

ts.test_NetworkObject_resume = function(t) {
  motion.start();
  var m = motion(motion.SERVER), errorTimeout;

  m.set({
    rate   : 0,
    tick   : function() {
      assert.ok(true);
      clearTimeout(errorTimeout);
      motion.stop().free(m);
      t.finish();
    }
  });

  errorTimeout = setTimeout(function() {
    assert.ok(false);
    motion.stop().free(m);
    t.finish();
  },50);
};

ts.test_network_object_timings = function(t) {

  t.finish();
};


ts.test_server_creation = function(t) {
  var m = motion(motion.SERVER);
  t.ok(m);
  motion.stop().free(m);
  t.finish();
};

ts.test_client_creation = function(t) {
  var m = motion(motion.CLIENT);
  t.ok(m);
  motion.stop().free(m);
  t.finish();
}



ts.test_client_server_handshake = function(t) {
  var p = {}
      s = motion(motion.SERVER),
      c1 = motion(motion.CLIENT),
      c2 = motion(motion.CLIENT);

  motion.start();
  motion.stop().free(s).free(c1).free(c2);
  t.finish();
}




// if this module is the script being run, then run the tests:
if (module === require.main) {
  require('async_testing').run(__filename, process.argv);
}