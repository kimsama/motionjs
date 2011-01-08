/*
 *  SETUP
 */
motion = (typeof motion === 'undefined')                     ?
          require(__dirname + '/../../../lib/motion').motion :
          motion;

if (typeof exports !== 'undefined') {
  var motionTests = exports
}
/*
 * END SETUP
 */

var interpolation = motionTests.interpolation = {};