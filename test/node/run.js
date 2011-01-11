var suites = [
  '/test/shared/tests/basic.js',
  '/test/shared/tests/scene.js',
  '/test/shared/tests/validation.js',
  '/test/shared/tests/lag.js',
  '/test/shared/tests/input.js',
  '/test/shared/tests/animation.js',
  '/test/shared/tests/interpolation.js',
  '/test/shared/tests/client.js',
  '/test/shared/tests/server.js',
  '/test/shared/tests/pipe.js'
];

if (process.argv.length > 2) {
  suites.map(function(suite) {
    if (suite.indexOf(process.argv[2]) > -1) {
      require('nodeunit/reporters/default').run([suite]);
    }
  });
} else {
  require('nodeunit/reporters/default').run(suites);
}
