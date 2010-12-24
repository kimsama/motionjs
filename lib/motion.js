(function(ns) {
  var now            = 0, // current time
      last           = 0, // previous current time
      motion         = function(mode) {
        var tickOperations = [],
            chain = {},
            binds = {},
            context,
            tickTimer = null;

        // Default to client mode if no mode was passed
        mode = ([motion.SERVER,
                 motion.CLIENT,
                 motion.OBSERVER].indexOf(mode) > -1) ?
               mode                                   :
               motion.CLIENT;


        // Setup tickOperations
        switch (mode) {
          case motion.SERVER:

            // TODO:
            // + add snapshot tick operation (~100ms)
            // + setup a delta queue

          break;

          case motion.CLIENT:

          break;

          case motion.OBSERVER:
           // TODO
          break;
        }

        //
        // Management
        //
        chain.ticker = {
          stop : function() {
            if (tickTimer) {
              clearInterval(tickTimer);
            }
          },
          start : function() {
            tickTimer = setInterval(function() {
              last = now;
              now = (new Date()).getTime();

              var i = 0, l = tickOperations.length;

              for (i; i<l; i++) {
                if (typeof tickOperations[i] === 'function') {
                  tickOperations[i](now);
                }
              }
            }, 20);
          }
        };

        //
        // Scene
        //

        // TODO: add the ability to track scene objects.



        //
        // Events
        //

        // Emit the arguments to all functions bound to the incoming type
        chain.emit = function(type) {
          if (binds[type] && binds[type].length) {
            var i = 0,
                a = Array.prototype.slice.call(arguments)
                type = a.shift(),
                b = binds[type],
                l = b.length;

            for (i;i<l;i++) {
              b[i].apply(chain, a);
            }
          }

          // keep on chaining
          return chain;
        };

        // Bind a function to an event type
        chain.on = function(type, fn) {
          // only allow functions.
          if (typeof fn === 'function') {
            if (!binds[type]) {
              binds[type] = [];
            }
            binds[type].push(fn);
          }

          // keep on chaining
          return chain;
        };

        // Remove a listener by type and fn
        chain.removeListener = function(type, fn) {
          if (binds[type]) {
            var index = binds[type].indexOf(fn);
            if (index > -1) {
              binds[type].splce(index, 1);
            }
          }

          // keep on chaining
          return chain;
        };

        // Remove all listeners of a type
        chain.removeAllListeners = function(type) {
          if (binds[type]) {
            delete binds[type];
          }

          // keep on chaining
          return chain;
        };

        // Start the tick timer
        chain.ticker.start();

        return chain;
      };

  // Constants
  motion.SERVER   = 1; // Validation/delta-compression
  motion.CLIENT   = 2; // Input Prediction/entity interpolation
  motion.OBSERVER = 3; // Read-only client


  // Expose to the incoming namespace
  ns.motion = motion;
}((typeof exports === 'undefined') ? window : exports));
