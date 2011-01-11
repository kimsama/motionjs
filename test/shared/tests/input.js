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

var input = motionTests.input = {};

input.device_input_should_be_mapped_to_actions = function(t) {
  var device = new (motion.models.InputDevice)();
  t.done();
};