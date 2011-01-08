var tests   = require(__dirname + '/../shared/tests/index'),
    testDir = "/shared/tests/";

require('nodeunit/reporters/default').run([
  testDir + 'basic.js'
]);
