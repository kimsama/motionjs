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
          instances.push(new (models[modes[mode]])(options || {}));
          return instances[instances.length - 1];
        } else {
          throw new Error("Motion mode '" + mode + "' is not valid");
        }
      },
      // Create a network message
      netMsg = function(type, data) {
        var m = {
          type       : 'motion',
          motion     : type,
          time       : now,
          data       : data
        };

        return m;
      };

  motion.free = function(instance) {
    instances = _.without(instances, instance);
    return motion;
  };
  
  motion.guid = function() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    }
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
  }

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

  // CONSTANTS
  motion.OK     = 1;
  motion.ERROR  = -1;
  motion.SERVER = 'server';
  motion.CLIENT = 'client';

  //
  // SHARED
  //

  models.NetworkTransport = Backbone.Model.extend({
    send : function(msg) {
      console.warn("Using default noop transport.send");
    },
    isMotionMsg : function(msg) {
      return (msg && msg.type && msg.type === "motion");
    },
    recv : function(msg) {
      var handlers = this.msgHandlers, endpoint = this.get('endpoint');

      msg.latency = msg.time - now;
      
      if (!this.isMotionMsg(msg)) {
        this.trigger('error:unhandled-message', msg);
        return;
      }

      if (!endpoint) {
        this.trigger('error:no-endpoint');
        return;
      }
      
      // TODO: instead of using handlers, utilize backbone's events.
      var res = (handlers[msg.motion]) ? 
                 handlers[msg.motion](endpoint, msg || {}) :
                 false;
      endpoint.trigger(msg.motion, msg, res);
      if (res) {
        this.send(res);
      }
    },
    msgHandlers : {
      'client:connecting' : function(endpoint, msg) {
        var clients = endpoint.get('clients');
        msg.data.id = motion.guid();

        clients.add(new models.Client(msg.data));
        return netMsg('client:handshake', {
          id     : msg.data.id,
          status : motion.OK,
          latency : msg.latency
        });
      },
      'client.handshake'  : function(endpoint, msg) {
        return netMsg('client:connected', {
          latency : msg.latency
        });
      },
      'client:connected'  : function(endpoint, msg) {},
      'client:disconnecting' : function(endpoint, msg) { 
        return netMsg('client:disconnected', { 
          status : motion.OK,
          latency : msg.latency
        });
      },
      
      
    }
  });

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
  
  // Base object time sensitive objects
  models.TickHandler = Backbone.Model.extend({ 
    defaults : {
      rate   : 0,
      last   : now,
      paused : false,
      tick   : function(time) { /* noop */ }
    },
  });
  
  models.NetworkEndpoint = models.TickHandler.extend({
    initialize : function() {
      this.set({ 'transport' : new models.NetworkTransport({ endpoint : this }) });
    }
  })

  //
  // SERVER
  //
  models.Client  = models.NetworkEndpoint.extend({
    
  });
  
  models.ClientCollection = Backbone.Collection.extend({
    model : models.Client
  });
  
  models.NetworkServer = models.NetworkEndpoint.extend({
    initialize : function() {
      this.set({ clients : new models.ClientCollection() });
      models.NetworkEndpoint.prototype.initialize.apply(this, arguments);
    }
  });
  
  models.SceneSnapshot = Backbone.Model.extend({
    
  });
  
  //
  // CLIENT
  //
  models.NetworkClient = models.NetworkEndpoint.extend({
    connect : function() {
      this.get('transport').send(netMsg('client:connecting', this.toJSON()));
    },
    disconnect : function() {
      this.get('transport').send(netMsg('client:disconnecting', this.toJSON()));
    }
  });

  models.InputDevice = Backbone.Model.extend({
    
  });

  // EXPOSE
  motion.models = models;
  exports.motion = motion;
}((typeof exports === 'undefined') ? window : exports));