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
  var s = motion(motion.SERVER),
      c = motion(motion.CLIENT);

  // Setup the send/recv pipe
  s.get('transport').send = function(msg) {
    c.get('transport').recv(msg);
  };

  c.get('transport').send = function(msg) {
    s.get('transport').recv(msg);
  }

  c.bind('client:handshake', function(msg) {
    assert.ok(msg.data.status === motion.OK);
    this.disconnect();
  });

  c.bind('client:disconnected', function(msg) {
    assert.ok(msg.data.status === motion.OK);
    t.finish();
  });

  c.connect();
  motion.stop().free(s).free(c);
}


// if this module is the script being run, then run the tests:
if (module === require.main) {
  require('async_testing').run(__filename, process.argv);
}
