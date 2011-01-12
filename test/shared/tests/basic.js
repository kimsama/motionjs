/*
 *  SETUP
 */
motion = (typeof motion === 'undefined')                     ?
          require(__dirname + '/../../../public/lib/motion').motion :
          motion;

if (typeof exports !== 'undefined') {
  var motionTests = exports
}
/*
 * END SETUP
 */

var basic = motionTests.basic = {};
/*
basic.test_callsites = function(t) {
  t.ok(motion.models);
  t.done();
};

basic.test_NetworkObject_pause = function(t) {
  motion.start();
  var m = motion(motion.SERVER);

  m.set({
    paused : true,
    rate   : 0,
    tick   : function() {
      t.ok(false);
      motion.stop().free(m);
      t.done();
    }
  });

  setTimeout(function() {
    t.ok(true);
    motion.stop().free(m);
    t.done();
  },50);
};

basic.test_NetworkObject_resume = function(t) {
  motion.start();
  var m = motion(motion.SERVER), errorTimeout;

  m.set({
    rate   : 0,
    tick   : function() {
      t.ok(true);
      clearTimeout(errorTimeout);
      motion.stop().free(m);
      t.done();
    }
  });

  errorTimeout = setTimeout(function() {
    t.ok(false);
    motion.stop().free(m);
    t.done();
  },50);
};

basic.test_server_creation = function(t) {
  var m = motion(motion.SERVER);
  t.ok(m);
  motion.stop().free(m);
  t.done();
};

basic.test_client_creation = function(t) {
  var m = motion(motion.CLIENT);
  t.ok(m);
  motion.stop().free(m);
  t.done();
}*/

basic.test_client_server_handshake = function(t) {
debugger;
  motion.Transport = motion.models.InMemoryTransport;
  var s = new motion.models.NetworkServer(),
      c = new motion.models.NetworkClient();


  c.bind('client:handshake', function(msg) {
    t.ok(msg.data.status === motion.OK);
    this.get('transport').disconnect();
  });

  c.bind('client:disconnected', function(msg) {
    t.ok(msg.data.status === motion.OK);
    t.done();
  });

  c.get('transport').connect(s);

  c.get('transport').bind("all", function(name, msg) { console.log("CLIENT TRANSPORT", name, msg.motion); })

  c.get('transport').disconnect();
  motion.stop().free(s).free(c);
}
