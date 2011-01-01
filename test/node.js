var motion = require("motion").motion,
    assert = require("assert"),
    ts  = exports;

ts.test_callsites = function(t) {
  t.ok(motion.models);
  t.finish();
};

ts.test_server_creation = function(t) {
  t.ok(motion(motion.SERVER));
  t.finish();
};

ts.test_client_creation = function(t) {
  t.ok(motion(motion.CLIENT));
  t.finish();
}




// if this module is the script being run, then run the tests:
if (module === require.main) {
  require('async_testing').run(__filename, []);
}