const { Complexity } = require('eslintcc');

const complexity = new Complexity();
const report = complexity.executeOnFiles([
  './api/activity/index.js',
  './api/auth/index.js',
  './api/user/index.js',
]);

console.log(JSON.stringify(report, null, 2));
