(function(ns, undefined) {
  var now            = Date.now(), // current time
      last           = now, // previous current time
      motion         = function(mode, config) {
        config = config || {};

        var tickOperations = [],
            chain          = {},
            binds          = {},
            context        = {
              controllers : {},
              config      : {}
            },
            tickTimer      = null;
            
            context.config.debug    = config.debug || false;
            context.config.tickRate = config.tickRate || 1000/33;
            context.config.syncRate = config.syncRate || 1000/20;

        // Debug mode
        if (context.config.debug) {
          chain.netMsg = netMsg;
        }

        // Default to client mode if no mode was passed
        mode = ([motion.SERVER,
                 motion.CLIENT,
                 motion.OBSERVER].indexOf(mode) > -1) ?
               mode                                   :
               motion.CLIENT;

        // Setup Tick
        context.lastTickTime = now;
        tickOperations.push(function(time) {
          if (time - context.lastTickTime > context.config.tickRate) {
            chain.emit('tick', time);
          }
        });

        //
        // Scene
        //

        chain.scene = function() {
          var sceneObjects    = {},
              sceneTimeline   = [],
              sceneEventQueue = [],
              lastSnapshot    = now,
              helper          = {};
          
          tickOperations.push(function(time) {
            if (time - lastSnapshot > context.config.syncRate) {
              
              var deltas = {},
                  i      = 0,
                  l      = sceneEventQueue.length,
                  delta  = null,
                  finalDiff,
                  snapshot;

              for (i; i<l; i++) {
                delta = sceneEventQueue[i];
                if (!deltas[delta.id]) {
                  deltas[delta.id] = {};
                }
                
                if (typeof deltas[delta.id][delta.property] === 'undefined') {
                  finalDiff = delta.delta;
                } else {
                  finalDiff = helper.mergeDiffs(deltas[delta.id][delta.property],
                                                delta.delta);
                }
                deltas[delta.id][delta.property] = finalDiff;
              }
              
              snapshot = {
                time   : time,
                deltas : deltas
              };
              
              sceneTimeline.push(snapshot);
              
              lastSnapshot = time;
              chain.emit('snapshot', snapshot);
            }
          })
          
          helper.diff = function(old, current) {
            if (old === current) {
              return false;
            }
            
            if (typeof old === 'number') {
              return current - old;
            }
            // TODO: strings, objects, etc
          };
          
          helper.mergeDiffs = function(a, b) {
            if (typeof a === 'number') {
              return a + b;
            }
          };
          
          helper.wrap = function(id, obj, validationFn) {
            validationFn = (typeof validationFn === 'function') ?
                            validationFn                        :
                            false;

            sceneObjects[id] = {
              validation : validationFn,
              obj        : obj,
              properties : {
                orig : obj, 
                set  : function(k, v) {
                  var diff= helper.diff(obj[k], v);
                  if ((!validationFn || validationFn(k, v)) && diff !== false) {
                    sceneEventQueue.push({
                      id       : id,
                      property : k,
                      delta    : diff
                    });

                    obj[k] = v;
                  }
                },
                get  : function(k) {
                  return obj[k];
                }
              }
            };
            return helper.obj(id);
          };

          helper.timeline = function(){
            // TODO: faster object copy
            return JSON.parse(JSON.stringify(sceneEventQueue));
          };

          helper.unwrap = function(id) {
            if (sceneObjects[id]) {
              var _obj = sceneObjects[id];
              delete sceneObjects[id];
              return _obj;
            }
          };
          
          helper.obj = function(id) {
            return sceneObjects[id].properties;
          };
          
          return helper;
        };

        //
        // User controllers
        //
        
        // Generic controller
        chain.controller = function(name, sampleRate) {
          if (!context.lastControllerSync) {
            context.lastControllerSync = now;
            // Sync all controllers at a constant rate.
            tickOperations.push(function(time) {
              var c = context.controllers, events = {}, q, k;
              for (k in c) {
                if (c.hasOwnProperty(k)) {
                  c[k].sample(time);
                }
              }

              if (time - context.lastControllerSync >= context.config.syncRate)
              {
                for (k in c) {
                  if (c.hasOwnProperty(k)) {
                    q = c[k].dequeue();
                    if (q && q.length) {
                      events[k] = q;
                    }
                  }
                }
                chain.emit('sync', netMsg('actions', events));
                context.lastControllerSync = now;
              }
            });
          }

          var eventQueue     = [],
              lastSampleTime = now;

          context.controllers[name] = {
            sample : function(time) {
              if (time - lastSampleTime >= sampleRate) {
                eventQueue.push({
                  time : now
                });
                lastSampleTime = now;
              }
            },
            set : function(properties) {
              properties.time = now;
              eventQueue.push(properties);
              lastSampleTime = now;
            },
            dequeue : function() {
              var q = eventQueue;
              eventQueue = [];
              return q;
            }
          };
          return context.controllers[name];
        }

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
        
        //
        // Networking
        //

        // Handle an incomming message
        chain.handle = function(msg) {
          if (msg && msg.type && msg.type === "motion" && msg.motionType) {
            switch (msg.motionType) {
              case 'sync':
                
                return true;
              break;
            }
          }
          return false;
        };

        // 
        // Final Setup
        //
        
        // Setup tickOperations
        switch (mode) {
          case motion.SERVER:
            var delta = false,
                lastTick = 0,
                timeline = [];
                
            chain.on('snapshot', function(snapshot) {
              timeline.push(snapshot);
            });

            context.lastSyncTime = now;
            tickOperations.push(function(time) {
              if (time - context.lastSyncTime >= context.config.syncRate) {
                chain.emit('sync', timeline);
                timeline = [];
                context.lastSyncTime = time;
              }
            });
            
          break;

          case motion.CLIENT:
            if (!config.syncRate) {
              context.config.syncRate = 100;
            }
          break;

          case motion.OBSERVER:
           // TODO
          break;
        }

        return chain;
      };

  // Constants
  motion.SERVER   = 1; // Validation/delta-compression
  motion.CLIENT   = 2; // Input Prediction/entity interpolation
  motion.OBSERVER = 3; // Read-only client

  // Expose to the incoming namespace
  ns.motion = motion;
}((typeof exports === 'undefined') ? window : exports));