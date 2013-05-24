// Generated by CoffeeScript 1.6.2
(function() {
  var $, Core, Methods, Player, Playlist, core, input, _i, _len, _ref;

  global.document = document;

  Player = require('./js/player');

  Playlist = require('./js/playlist');

  $ = require('./js/dom');

  Core = require('./../bin/core');

  Methods = require('./../bin/methods');

  core = new Core();

  global.App = new Methods(core);

  core.init();

  global.Player = new Player($["class"]('audio-controls')[0]);

  window.playlist = new Playlist($["class"]('playlist')[0]);

  global.focus = false;

  _ref = $.tag('input');
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    input = _ref[_i];
    input.addEventListener('focus', function() {
      return global.focus = true;
    });
    input.addEventListener('blur', function() {
      return global.focus = false;
    });
  }

}).call(this);
