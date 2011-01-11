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

var scene          = motionTests.scene = {},
    buildTankScene = function() {
      var s = new motion.models.Scene({
        name     : "game",
        children : [
          { 
            name : 'ball',
            x    : 10,
            y    : 10
          },
          // test nested objects
          {
            name : "tank",
            children : [
              {
                name  : 'chassis',
                x     : 0,
                y     : 0,
                width : 100,
                height: 200
              },
              {
                name : "turret",
                x         : 20,
                y         : 60,
                direction : 45
              }
            ]
          }
        ]
      });
      s.save();
      return s;
    };

motion.sync(function(method, model, success, error) { 
  success();
});

scene.test_creation_and_traversal = function(t) {
  s = buildTankScene();

  sceneChildren = s.get('children'),
  player1       = sceneChildren.byProperty('name', 'tank'),
  turret        = player1.get('children').byProperty('name', 'turret');

  t.ok(sceneChildren.length === 2);
  t.ok(turret.get('name') === "turret")
  t.done();
};

scene.test_snapshot_creation = function(t) {
  var s = buildTankScene(), snapshot;

  s.get('children').byProperty('name', 'tank')
   .get('children').byProperty('name', 'turret')
   .set({ direction : 90 });

  snapshot = s.snapshot();

  t.ok(snapshot.children.length === 2);
  t.ok(typeof snapshot.children[0] === 'undefined');
  t.ok(typeof snapshot.children[1].children[0] === 'undefined');
  t.ok(snapshot.children[1].children[1].direction === 90);

  t.done();
};