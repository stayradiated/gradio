'use strict';

var coffee, Methods;

/* Load CoffeeScript Compiler */
coffee = require('coffee-script');
if (typeof coffee.register !== 'undefined') coffee.register();

/* Return Methods Module */
Methods = require('./source/methods.coffee');
module.exports = Methods;
