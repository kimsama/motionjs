(function(exports, undefined) {
  //
  // SETUP motionjs
  //
  var Backbone  = (typeof require !== 'undefined') ? require("backbone") : exports.Backbone,
      models    = {},
      modes     = {'client' : 'NetworkClient', 'server' : 'NetworkServer'},
      now       = Date.now(), // current tick
      last      = Date.now(), // last tick
      tickDelta = 0,          // average time between ticks (optimally 0)
      instances = [],
      started   = false,
      motion    = function(mode, options) {
        if (modes[mode]) {
          instances.push(new (models[modes[mode]])(options));
          return instances[instances.length - 1];
        } else {
          throw new Error("Motion mode '" + mode + "' is not valid");
        }
      };

  // Global ticker
  motion.start = function() {
    started = true;
    setTimeout(function tick(){
      var i = 0, l = instances.length, instance;

      last          = now;
      now           = Date.now();
      // This is used to track how long a setTimeout(fn, 0) takes as each browser/OS
      // is different.
      tickDelta = Math.floor((((last+now)/2) + tickRate)/2);

      for (i; i<l; i++) {
        instance = instances[i];
        if (instance && typeof instance.tick === 'function') {
          instance.tick(now);
        }
      }

      if (started) {
        setTimeout(tick, 0);
      }
    }, 0);
  };
  
  motion.tickDelta = tickDelta;
  
  // Stop all motion simulations.
  motion.stop = function() {
    started = false;
  }
  

  motion.SERVER = 'server';
  motion.CLIENT = 'client';

  //
  // SERVER
  //
  models.NetworkServer = Backbone.Model.extend({
    paused : false,
    tick   : function(time) {
      if (paused) { return; }
      var i = 0, l = tickOperations.length;

      for (i; i<l; i++) {
        tickOperations[i](now);
      }
    }
  });
  
  models.SceneSnapshot = Backbone.Model.extend({
    
  });
  
  //
  // CLIENT
  //
  models.NetworkClient = Backbone.Model.extend({
    
  });

  models.InputDevice = Backbone.Model.extend({
    
  });

  //
  // SHARED
  //

  // TIME

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

  // EXPOSE
  motion.models = models;
  exports.motion = motion;
}((typeof exports === 'undefined') ? window : exports));