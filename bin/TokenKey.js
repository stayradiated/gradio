// Generated by CoffeeScript 1.6.2
(function() {
  var data, fs, prop, tokenFile;

  fs = require('fs');

  tokenFile = '../token.json';

  data = fs.readFileSync(tokenFile).toString();

  prop = JSON.parse(data);

  module.exports = prop;

}).call(this);
