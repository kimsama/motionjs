var suites = [
  'basic',
  'scene',
  'validation',
  'lag',
  'input',
  'animation',
  'interpolation'
];

suites.map(function(suite) {
  if (process.argv.length < 3 || process.argv[2] === suite) {
    require('nodeunit/reporters/default').run(['/test/shared/tests/' + suite + '.js']);
  }
});
