(function(exports, undefined) {
  //
  // SETUP motionjs
  //
  var hasRequire = (typeof require !== 'undefined'),
      Backbone   = (hasRequire) ? require("backbone") : exports.Backbone,
      _          = (hasRequire) ? require('underscore')._ : _,
      models     = {},
      modes      = {'client' : 'NetworkClient', 'server' : 'NetworkServer'},
      now        = Date.now(), // current tick
      last       = now,        // last tick
      tickDelta  = 0,          // rolling average time between ticks (optimally 0)
      instances  = [],
      started    = false,
      motion     = function(mode, options) {
        if (modes[mode]) {
          instances.push(new (models[modes[mode]])(options));
          return instances[instances.length - 1];
        } else {
          throw new Error("Motion mode '" + mode + "' is not valid");
        }
      };

  motion.free = function(instance) {
    instances = _.without(instances, instance);
    return motion;
  };

  // Global ticker
  motion.start = function(timeout) {
    started = true;
    timeout = timeout || 0;

    setTimeout(function nextTick(){
      var i = 0, l = instances.length, instance, last, tick, rate;

      last          = now;
      now           = Date.now();
      // This is used to track how long a setTimeout(fn, timeout) takes as each browser/OS
      // is different.
      tickDelta = Math.floor((((last+now)/2) + tickDelta)/2) - timeout;

      for (i; i<l; i++) {
        instance = instances[i];
        last = instance.get('last') || now;
        tick = instance.get('tick');
        rate = instance.get('rate');

        if (!instance.get('paused') && now - last >= rate) {
          instance.set({'last' : now});
          if (_.isFunction(tick)) {
            tick(now);
          }
        }
      }

      if (started) {
        setTimeout(nextTick, timeout);
      }
    }, timeout);
  };
  
  motion.tickDelta = tickDelta;
  
  // Stop all motion simulations.
  motion.stop = function() {
    started = false;
    return motion;
  }

  motion.SERVER = 'server';
  motion.CLIENT = 'client';

  //
  // SHARED
  //

  // SCENE
  // Scene Object
  models.SceneObject = Backbone.Model.extend({
    
  });

  // Scene
  models.Scene = Backbone.Collection.extend({
    model: models.SceneObject
  });

  // Scene
  models.SceneSnapshot = Backbone.Model.extend({
    
  });

  // Scene Timeline
  models.SceneTimeline = Backbone.Collection.extend({
    model : models.SceneSnapshot
  });

  // Mapping between InputDevice and an action to be performed on the scene
  models.DeviceAction = Backbone.Model.extend({
    
  });
  
  models.DeviceActionQueue = Backbone.Collection.extend({
    model: models.DeviceAction
  });
  
  // Management of sync-able Network objects
  models.NetworkManager = Backbone.Model.extend({ 
    defaults : {
      rate   : 0,
      last   : now,
      paused : false,
      tick   : function(time) { /* noop */ }
    },
  });

  //
  // SERVER
  //
  models.NetworkServer = models.NetworkManager.extend({
    
  });
  
  models.SceneSnapshot = Backbone.Model.extend({
    
  });
  
  //
  // CLIENT
  //
  models.NetworkClient = models.NetworkManager.extend({});

  models.InputDevice = Backbone.Model.extend({
    
  });

  // EXPOSE
  motion.models = models;
  exports.motion = motion;
}((typeof exports === 'undefined') ? window : exports));