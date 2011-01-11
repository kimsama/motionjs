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

var interpolation = motionTests.interpolation = {};

interpolation.test_timeline = function(t) {
  /*
     scene starts a at 0
     server moves a to 10   (10ms)
     client recieves a (10) (30ms) (20ms latency)
     (client interops a at .5 units per second)
     server moves a to 20   (60ms)
     client receives a (20) (100ms) (40ms latency)
     (client interops at .5 units a second)
     server moves a to 30   (110ms)
     client recieves a (30) ()
     client at ()
  */

  var scene = {
    name : "ball",
    a    : 10
  },
  serverScene = new motion.models.Scene(scene),
  clientScene = new motion.models.Scene(scene);
  
  
  
  
  t.done();

};