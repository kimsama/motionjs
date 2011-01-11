/*
 *  SETUP
 */
motion = (typeof motion === 'undefined')                     ?
          require(__dirname + '/../../../public/lib/motion').motion :
          motion;

if (typeof exports !== 'undefined') {
  var motionTests = exports;
}
/*
 * END SETUP
 */

var client          = motionTests.client = {};