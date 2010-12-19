(function(ns) {

  ns.Motion = function() {
    var self = this, scene = {}, diff = {};

    this._snapshotTimeout = 16;
    this._snapshotTimer   = null;

    this.snapshotQueue    = [];
    this.snapshotActions  = [];

    this.__defineGetter__('changes_since_last_snapshot', function() {
      return diff;
    });


    this.snapshot = function() {
      var i = 0,
          l = this.snapshotActions.length,
          action,
          ret = {};

      for (i; i<l; i++) {
        action = this.snapshotActions[i];
        if (typeof action === "function") {
          action(ret);
        }
      }

      this.send("snapshot.diff", this.changes_since_last_snapshot);

      // reset the diff
      diff = {};
    };


    this.set = function(name, value) {
      if (this.validate(name, value) === true) {
        scene[name] = value;
        diff[name] = value;
      }
    };

    this.get = function(name) {
      return scene[name] || null;
    };
  };

  ns.Motion.prototype = {

    get snapshot_timeout() {
      return this._snapshotTimeout;
    },

    set snapshot_timeout(val) {
      this._snapshotTimeout = val;

      // Only restart if already started
      if (this._snapshotTimer) {
        this.stop();
        this.start();
      }
    },

    start : function() {
      var self = this;

      this._snapshotTimer = setInterval(function() {
        self.snapshot.call(self);
      }, this._snapshotTimeout);
    },

    stop  : function() {
      clearInterval(this._snapshotTimer);
      this._snapshotTimer = null;
    },

    validationSteps : [],
    validate : function(name, value) {
      var i = 0,
          l = this.validationSteps.length,
          step;

      for (i; i<l; i++) {
        step = this.validationSteps[i];
        if (typeof step === "function") {
          if (step(name, value) === false) {
            return false;
          }
        }
      }
      return true;
    },

    send : function(type, data) { /* noop */ }
  }

}((typeof exports === 'undefined') ? window.motionjs = {} : exports));
