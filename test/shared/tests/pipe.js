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

var pipeTests = motionTests.pipeTests = {};

// This test spawns up two clients and connects them both to a server.
// The second client then broadcasts a chat message which player 1
//  recieves and responds.
pipeTests.ensure_pipe_works_with_multiple_clients = function(t) {
  motion.Transport = motion.models.InMemoryTransport;
  var c1 = new motion.models.NetworkClient({'name' : 'client1' }),
      c2 = new motion.models.NetworkClient({'name' : 'client2' }),
      s  = new motion.models.NetworkServer();

  c1.get('transport').bind('all', function(name) { console.log(arguments) });

  c1.get('transport').connect(s);
  c1.bind('client:connected', function() {

    c2.get('transport').connect(s);
console.log("here")
    c2.bind('client:connected', function() {
      c2.get('transport').send(motion.netMsg('chat:message', "hello player 1"));
    });

    c2.bind('chat:message', function(msg) {
      t.ok(msg.data === "hello");
      t.done();
    });
  });

  c1.bind('chat:message', function(msg) {
    t.ok(msg.data === "hello player 1");
    c1.get('transport').send(motion.netMsg('chat:message', 'hello'));
  });

  setTimeout(function preventDelay() {
    t.fail("the connection failed");
    t.done();
  }, 100);
};
