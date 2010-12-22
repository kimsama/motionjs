# Motion.js

This is generic library for handling the lag experienced between a client,
server, and other clients while interacting with a realtime scene. Motion.js
hooks into your existing scene (game, collaborative app, etc..) and validates
all client activity on a central server.  The server contains a 'master' scene
which sends updates to all affected clients when the scene changes (on a fixed
interval).

Motion.js employs a few techniques to provide a seemingly "laggless" experience
in realtime javascript applications:

 * Entity interpolation
 * Input prediction
 * Lag compensation

## API

### Scene management

    var motion        = new Motion(),
        sceneObjectId = motion.register(sceneObject);

    // Movement sampling
    // This is used for sampling user controlled object's positions
    motion.sample(sceneObjectId, {
      x : function(obj) {
        return parseInt($(obj).css('left'));
      },
      className : 'className'
    ], 10);

    // Movement updates (from server)
    motion.link(sceneObjectId, {
      x : function(obj, value) {
        // Validate the value and apply it if appropriate
        if (value > 0 && value < 100) {
          $(obj).css('left', value + px)
        }
      },
      className : 'className'
    });

### Networking

    var clients = [{}, {}, {}];

    motion.transport(clients, function sendMsg(obj) {
      socketIO.send(obj);
    });

    socketIO.on('message', function(msg) {
      if (msg && msg.motionType) {
        motion.handle(msg);
      } else {
        // Handle other types of messages
      }
    });

## Entity Interpolation

Entity interpolation is achieved by queuing scene updates until the next
snapshot.  Snapshots happen many times per second and can be configured by
setting the `snapshot_timeout` property to a millisecond value (default = 100).

## Input Prediction

Input Prediction provides the means for allowing a client to have responsive
local controls without waiting for a round-trip to the server.  This is achieved
by immediately performing the action and sending the action to the server to be
validated.  On the next scene snapshot the client can use `Lag compensation` to
arrive at the actual server generated location.

## Lag compensation

When a new snapshot is recieved by a client, the current scene values are
progressively updated over a period of time to avoid "jumpyness". Over a few
milliseconds the entities the client was interacting with will be in their
appropriate locations.

# Where does it run?

Node.js and in A grade browsers

# License

MIT - copyright Elijah Insua 2010

