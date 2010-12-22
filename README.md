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

### Basics

 `var motion = new Motion(tickRate)`

 `tickRate` is the delay between snapshots in milliseconds

 `motion`.`tickRate`
 getter and setter to manipulate how long to wait between snapshots (in ms)

### Scene management

var `id` = `motion`.`add(obj)`

Register an existing scene object with motionjs. This can be a dom element, an
object in a custom scene graph that you've built, or any other type of object.

 **@return (string)** an id which is used when accessing the registered object
 later on

`motion`.`sample`(`id`, `getters`, `timeout`)

 * `id` - the identifier returned from `add`
 * `getters` - an object which specifies which properties to monitor and optionally how

        {
          x : function(obj) {
            return obj.coords.x;
          },
          className : 'className'
        }

      the default is `propertyName : 'propertyName', but a function may be provided

   
 * `timeout` - the time (in ms) between sampling the provided properties

`motion`.`link`(`id`, `setters`)

Glue the `motion` object to it's scene object counterpart.

 * `id` - the identifier returned from `add`
 * `setters` - a list of properties that should be updated when a snapshot is received from a remote source.  This definition should include validation.

        {
          x : function(obj, value) {
            // Validate the value and apply it if appropriate
            if (value > 0 && value < 100) {
              obj.coords.x = value;
            }
         }
        }


### An example

    var motion        = new Motion(),
        sceneObjectId = motion.add(sceneObject);

    // Movement sampling
    // This is used for sampling user controlled object's positions
    motion.sample(sceneObjectId, {
      x : function(obj) {
        return obj.coords.x;
      },
      className : 'className'
    ], 10);

    // Movement updates (from server)
    motion.link(sceneObjectId, {
      x : function(obj, value) {
        // Validate the value and apply it if appropriate
        if (value > 0 && value < 100) {
          obj.coords.x = value;
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
