(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __slice = [].slice,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  (function(files) {
    var cache, module, req;
    cache = {};
    req = function(id) {
      var file;
      if (cache[id] == null) {
        if (files[id] == null) {
          if ((typeof require !== "undefined" && require !== null)) {
            return require(id);
          }
          console.log("Cannot find module '" + id + "'");
          return null;
        }
        file = cache[id] = {
          exports: {}
        };
        files[id][1].call(file.exports, (function(name) {
          var realId;
          realId = files[id][0][name];
          return req(realId != null ? realId : name);
        }), file, file.exports);
      }
      return cache[id].exports;
    };
    if (typeof module === 'undefined') {
      module = {};
    }
    return module.exports = req(0);
  })([
    [
      {
        /*
          /home/stayrad/Projects/Groovy/app/source/js/init.coffee
        */

        './app.coffee': 1
      }, function(require, module, exports) {
        var app;
        app = require('./app.coffee');
        return $(function() {
          return app.init();
        });
      }
    ], [
      {
        /*
          /home/stayrad/Projects/Groovy/app/source/js/app.coffee
        */

        'base': 2,
        'ranger': 3,
        'jqueryify': 13,
        './client': 14,
        './player': 18,
        './search': 20,
        './bar': 21
      }, function(require, module, exports) {
        var $, Bar, Base, Client, Player, Ranger, Search;
        Base = require('base');
        Ranger = require('ranger');
        $ = require('jqueryify');
        Client = require('./client');
        Player = require('./player');
        Search = require('./search');
        Bar = require('./bar');
        return module.exports.init = function() {
          var app, bar, focus, openItem, parseOffline, player, ranger, search;
          app = new Client();
          bar = new Bar({
            el: $('.bar')
          });
          search = new Search({
            el: $('header.panel')
          });
          player = new Player({
            el: $('section.controls')
          });
          ranger = new Ranger({
            el: $('section.columns')
          });
          ranger.setPanes([['Artist', 'ArtistName'], ['Songs', 'SongName']]);
          app.vent.on('result', function(method, song) {
            return ranger.add(song);
          });
          player.on('change', function(song) {
            return bar.setSong(song);
          });
          search.on('playlist', function(id) {
            ranger.clear();
            return app.getPlaylistByID(id);
          });
          search.on('search', function(query, type) {
            ranger.clear();
            return app.getSearchResults(query, type);
          });
          parseOffline = function() {
            var fs, songIDs;
            fs = require('fs');
            songIDs = [];
            return fs.readdir("" + __dirname + "/../../../cache", function(err, files) {
              var file, id, _i, _len;
              for (_i = 0, _len = files.length; _i < _len; _i++) {
                file = files[_i];
                id = file.match(/(\d+)\.mp3/);
                if (id != null) {
                  songIDs.push(id[1]);
                }
              }
              return app.getSongInfo(songIDs).then(function(results) {
                return ranger.load(results, [['Artist', 'ArtistName'], ['Songs', 'Name']]);
              });
            });
          };
          openItem = function() {
            var song;
            song = ranger.open();
            if (!song) {
              return;
            }
            return player.setSong(song);
          };
          $(document).on('keydown', function(e) {
            var _ref;
            switch (e.which) {
              case 13:
                console.log(focus);
                if (focus) {
                  return;
                }
                openItem();
                break;
              case 32:
                if (focus) {
                  return;
                }
                player.toggle();
                break;
              case 38:
                ranger.up();
                break;
              case 37:
                ranger.left();
                break;
              case 39:
                ranger.right();
                break;
              case 40:
                ranger.down();
            }
            if ((37 <= (_ref = e.which) && _ref <= 40)) {
              e.preventDefault();
              return false;
            }
          });
          $('.decorations').on('click', function() {
            return openItem();
          });
          focus = false;
          return $('input').each(function() {
            this.addEventListener('focus', function() {
              return focus = true;
            });
            return this.addEventListener('blur', function() {
              return focus = false;
            });
          });
        };
      }
    ], [
      {
        /*
          /home/stayrad/Projects/Groovy/app/node_modules/base/index.js
        */

      }, function(require, module, exports) {
        /*jslint node: true, nomen: true*/
      
      (function () {
          'use strict';
      
          var include, extend, inherit, View, Event, Model, Collection;
      
          // Copy object properties
          include = function (to, from) {
              var key;
              for (key in from) {
                  if (from.hasOwnProperty(key)) {
                      to[key] = from[key];
                  }
              }
          };
      
          // CoffeeScript extend for classes
          inherit = function (child, parent) {
              var key, Klass;
              for (key in parent) {
                  if (parent.hasOwnProperty(key)) {
                      child[key] = parent[key];
                  }
              }
              Klass = function () {
                  this.constructor = child;
              };
              Klass.prototype = parent.prototype;
              child.prototype = new Klass();
              child.__super__ = parent.prototype;
              return child;
          };
      
          // Backbone like extending
          extend = function (attrs) {
              var child, parent = this;
              if (!attrs) { attrs = {}; }
              if (attrs.hasOwnProperty('constructor')) {
                  child = attrs.constructor;
              } else {
                  child = function () {
                      child.__super__.constructor.apply(this, arguments);
                  };
              }
              inherit(child, parent);
              include(child.prototype, attrs);
              return child;
          };
      
      
          /*
           * EVENT
           */
      
          Event = (function () {
      
              function Event(attrs) {
                  this._events = {};
                  this._listening = [];
              }
      
              // Bind an event to a function
              // Returns an event ID so you can unbind it later
              Event.prototype.on = function (events, fn) {
                  var ids, id, i, len, event;
                  if (typeof fn !== 'function') {
                      throw new Error('fn not function');
                  }
      
                  // Allow multiple events to be set at once such as:
                  // event.on('update change refresh', this.render);
                  ids = [];
                  events = events.split(' ');
                  for (i = 0, len = events.length; i < len; i += 1) {
                      event = events[i];
                      // If the event has never been listened to before
                      if (!this._events[event]) {
                          this._events[event] = {};
                          this._events[event].index = 0;
                      }
                      // Increment the index and assign an ID
                      id = this._events[event].index += 1;
                      this._events[event][id] = fn;
                      ids.push(id);
                  }
      
                  return ids;
              };
      
              // Trigger an event
              Event.prototype.trigger = function (event) {
                  var args, actions, i;
                  args = 2 <= arguments.length ? [].slice.call(arguments, 1) : [];
      
                  // Listen to all events
                  if (event !== '*') {
                      this.trigger('*', event, args);
                  }
      
                  actions = this._events[event];
                  if (actions) {
                      for (i in actions) {
                          if (actions.hasOwnProperty(i) && i !== 'index') {
                              actions[i].apply(actions[i], args);
                          }
                      }
                  }
              };
      
              // Remove a listener from an event
              Event.prototype.off = function (events, id) {
                  var i, len;
                  if (Array.isArray(id)) {
                      for (i = 0, len = id.length; i < len; i += 1) {
                          this.off(events, id[i]);
                      }
                      return;
                  }
                  events = events.split(' ');
                  for (i = 0, len = events.length; i < len; i += 1) {
                      delete this._events[events[i]][id];
                  }
              };
      
              /**
               * Listen to multiple events from multiple objects
               * Use this.stopListening to stop listening to them all
               *
               * Example:
               *
               *   this.listen(object, {
               *      'create change': this.render,
               *      'remove': this.remove
               *   });
               *
               *   this.listen([
               *      objectOne, {
               *          'create': this.render,
               *          'remove': this.remove
               *      },
               *      objectTwo, {
               *          'change': 'this.render
               *      }
               *   ]);
               *
               */
              Event.prototype.listen = function (obj, attrs) {
                  var i, len, event, listener;
                  if (Array.isArray(obj)) {
                      for (i = 0, len = obj.length; i < len; i += 2) {
                          this.listen(obj[i], obj[i + 1]);
                      }
                      return;
                  }
                  listener = [obj, {}];
                  for (event in attrs) {
                      if (attrs.hasOwnProperty(event)) {
                          listener[1][event] = obj.on(event, attrs[event]);
                      }
                  }
                  this._listening.push(listener);
              };
      
              // Stop listening to all events
              Event.prototype.stopListening = function (object) {
                  var i, len, obj, events, event;
                  for (i = 0, len = this._listening.length; i < len; i += 1) {
                      obj = this._listening[i][0];
                      if (!object || object === obj) {
                          events = this._listening[i][1];
                          for (event in events) {
                              if (events.hasOwnProperty(event)) {
                                  obj.off(event, events[event]);
                              }
                          }
                      }
                  }
                  this._listening = [];
              };
      
              return Event;
      
          }());
      
      
          /*
           * VIEW
           */
      
          View = (function () {
      
              function View(attrs) {
                  View.__super__.constructor.apply(this, arguments);
                  include(this, attrs);
      
                  if (!this.elements) {
                      this.elements = {};
                  }
      
                  if (!this.events) {
                      this.events = {};
                  }
      
                  if (this.el) {
                      this.bind();
                  }
              }
      
              // Load Events
              inherit(View, Event);
      
              View.prototype.bind = function (el) {
                  var selector, query, action, split, name, event;
      
                  // If el is not specified use this.el
                  if (!el) { el = this.el; }
      
                  // Cache elements
                  for (selector in this.elements) {
                      if (this.elements.hasOwnProperty(selector)) {
                          name = this.elements[selector];
                          this[name] = el.find(selector);
                      }
                  }
      
                  // Bind events
                  for (query in this.events) {
                      if (this.events.hasOwnProperty(query)) {
                          action = this.events[query];
                          split = query.indexOf(' ') + 1;
                          event = query.slice(0, split || 9e9);
                          if (split > 0) {
                              selector = query.slice(split);
                              el.on(event, selector, this[action]);
                          } else {
                              el.on(event, this[action]);
                          }
                      }
                  }
      
              };
      
              View.prototype.unbind = function (el) {
                  var selector, query, action, split, name, event;
      
                  // If el is not specified use this.el
                  if (!el) { el = this.el; }
      
                  // Delete elements
                  for (selector in this.elements) {
                      if (this.elements.hasOwnProperty(selector)) {
                          name = this.elements[selector];
                          delete this[name];
                      }
                  }
      
                  // Unbind events
                  for (query in this.events) {
                      if (this.events.hasOwnProperty(query)) {
                          action = this.events[query];
                          split = query.indexOf(' ') + 1;
                          event = query.slice(0, split || 9e9);
                          if (split > 0) {
                              selector = query.slice(split);
                              el.off(event, selector);
                          } else {
                              el.off(event);
                          }
                      }
                  }
      
              };
      
              // Unbind the view and remove the element
              View.prototype.release = function () {
                  this.unbind();
                  this.el.remove();
                  this.stopListening();
              };
      
              return View;
      
          }());
      
      
          /*
           * MODEL
           */
      
          Model = (function () {
      
              function Model(attrs) {
                  var set, get, key, self = this;
      
                  // Call super
                  Model.__super__.constructor.apply(this, arguments);
      
                  // Set attributes
                  if (!this.defaults) { this.defaults = {}; }
                  this._data = {};
                  include(this._data, this.defaults);
                  include(this._data, attrs);
      
                  set = function (key) {
                      return function (value) {
                          return self.set.call(self, key, value);
                      };
                  };
      
                  get = function (key) {
                      return function () {
                          return self.get(key);
                      };
                  };
      
                  for (key in this.defaults) {
                      if (this.defaults.hasOwnProperty(key)) {
                          this.__defineSetter__(key, set(key));
                          this.__defineGetter__(key, get(key));
                      }
                  }
      
              }
      
              // Load Events
              inherit(Model, Event);
      
              // Change a value
              Model.prototype.set = function (key, value, options) {
                  if (!this.defaults.hasOwnProperty(key)) {
                      this[key] = value;
                      return value;
                  }
                  if (value === this._data[key]) { return; }
                  this._data[key] = value;
                  if (!options || !options.silent) {
                      this.trigger('change', key, value);
                      this.trigger('change:' + key, value);
                  }
              };
      
              // Get a value
              Model.prototype.get = function (key) {
                  if (this.defaults.hasOwnProperty(key)) {
                      return this._data[key];
                  }
                  return this[key];
              };
      
              // Load data into the model
              Model.prototype.refresh = function (data, replace) {
                  if (replace) {
                      this._data = {};
                      include(this._data, this.defaults);
                  }
                  include(this._data, data);
                  this.trigger('refresh');
                  return this;
              };
      
              // Destroy the model
              Model.prototype.destroy = function () {
                  this.trigger('before:destroy');
                  delete this._data;
                  this.trigger('destroy');
                  return this;
              };
      
              // Convert the class instance into a simple object
              Model.prototype.toJSON = function (strict) {
                  var key, json;
                  if (strict) {
                      for (key in this.defaults) {
                          if (this.defaults.hasOwnProperty(key)) {
                              json[key] = this._data[key];
                          }
                      }
                  } else {
                      json = this._data;
                  }
                  return json;
              };
      
      
              return Model;
      
          }());
      
      
          /*
           * COLLECTION
           */
      
          Collection = (function () {
      
              function Collection() {
                  Collection.__super__.constructor.apply(this, arguments);
                  this.length  = 0;
                  this._index  = 0;
                  this._models = [];
                  this._lookup = {};
              }
      
              // Load Events
              inherit(Collection, Event);
      
              // Access all models
              Collection.prototype.all = function () {
                  return this._models;
              };
      
              // Create a new instance of the model and add it to the collection
              Collection.prototype.create = function (attrs, options) {
                  var model = new this.model(attrs);
                  this.add(model, options);
                  return model;
              };
      
              // Add a model to the collection
              Collection.prototype.add = function (model, options) {
      
                  var id, index, self = this;
      
                  // Set ID
                  if (model.id) {
                      id = model.id;
                  } else {
                      id = 'c-' + this._index;
                      this._index += 1;
                      model.set('id', id, {silent: true});
                  }
      
                  // Add to collection
                  model.collection = this;
                  index = this._models.push(model) - 1;
                  this._lookup[id] = index;
                  this.length += 1;
      
                  // Bubble events
                  this.listen(model, {
                      '*': function (event, args) {
                          args = args.slice(0);
                          args.unshift(event + ':model', model);
                          self.trigger.apply(self, args);
                      },
                      'before:destroy': function () {
                          self.remove(model);
                      }
                  });
      
                  // Only trigger create if silent is not set
                  if (!options || !options.silent) {
                      this.trigger('create:model', model);
                      this.trigger('change');
                  }
      
              };
      
              // Remove a model from the collection
              // Does not destroy the model - just removes it from the array
              Collection.prototype.remove = function (model) {
                  var index = this.indexOf(model);
                  this._models.splice(index, 1);
                  delete this._lookup[model.id];
                  this.length -= 1;
                  this.stopListening(model);
                  this.trigger('remove:model');
                  this.trigger('change');
              };
      
              // Reorder the collection
              Collection.prototype.move = function (model, pos) {
                  var index = this.indexOf(model);
                  this._models.splice(index, 1);
                  this._models.splice(pos, 0, model);
                  this._lookup[model.id] = index;
                  this.trigger('change:order');
                  this.trigger('change');
              };
      
              // Append or replace the data in the collection
              // Doesn't trigger any events when updating the array apart from 'refresh'
              Collection.prototype.refresh = function (data, replace) {
                  var i, len;
                  if (replace) {
                      this._models = [];
                      this._lookup = {};
                  }
                  for (i = 0, len = data.length; i < len; i += 1) {
                      this.create(data[i], { silent: true });
                  }
                  return this.trigger('refresh');
              };
      
              // Loop over each record in the collection
              Collection.prototype.forEach = function () {
                  return this._models.forEach.apply(this._models, arguments);
              };
      
              // Filter the models
              Collection.prototype.filter = function () {
                  return this._models.filter.apply(this._models, arguments);
              };
      
              // Sort the models. Does not alter original order
              Collection.prototype.sort = function () {
                  return this._models.sort.apply(this._models, arguments);
              };
      
              // Get the index of the item
              Collection.prototype.indexOf = function (model) {
                  if (typeof model === 'string') {
                      // Convert model id to actual model
                      return this.indexOf(this.get(model));
                  }
                  return this._models.indexOf(model);
              };
      
              // Convert the collection into an array of objects
              Collection.prototype.toJSON = function () {
                  var i, id, len, record, results = [];
                  for (i = 0, len = this._models.length; i < len; i += 1) {
                      record = this._models[i];
                      results.push(record.toJSON());
                  }
                  return results;
              };
      
              // Return the first record in the collection
              Collection.prototype.first = function () {
                  return this.at(0);
              };
      
              // Return the last record in the collection
              Collection.prototype.last = function () {
                  return this.at(this.length - 1);
              };
      
              // Return the record by the id
              Collection.prototype.get = function (id) {
                  var index = this._lookup[id];
                  return this.at(index);
              };
      
              // Return a specified record in the collection
              Collection.prototype.at = function (index) {
                  return this._models[index];
              };
      
              // Check if a model exists in the collection
              Collection.prototype.exists = function (model) {
                  return this.indexOf(model) > -1;
              };
      
              return Collection;
      
          }());
      
          // Add the extend to method to all classes
          Event.extend = View.extend = Model.extend = Collection.extend = extend;
      
          // Export all the classes
          module.exports = {
              Event: Event,
              View: View,
              Model: Model,
              Collection: Collection
          };
      
      }());
      ;
      }
    ], [
      {
        /*
          /home/stayrad/Projects/Groovy/app/node_modules/ranger/lib/controllers/ranger.js
        */

        '../views/ranger': 4,
        '../models/pane': 11
      }, function(require, module, exports) {
        (function () {
      
        'use strict';
      
        var View, Ranger, Pane;
      
        View = require('../views/ranger');
        Pane = require('../models/pane').prototype.model;
      
        Ranger = (function () {
      
          function Ranger (attrs) {
            this.view = new View(attrs);
      
            this.up = this.view.up;
            this.down = this.view.down;
            this.left = this.view.left;
            this.right = this.view.right;
            this.open = this.view.open;
      
          };
      
          Ranger.prototype.setPanes = function(panes) {
            this.panes = panes;
            this.view.panes.create({
              title: panes[0][0],
              key: panes[0][1]
            });
          };
      
          Ranger.prototype.findPane = function(name) {
            for (var i = this.panes.length - 1; i >= 0; i--) {
              if (this.panes[i][1] == name) {
                return i;
              }
            };
            return -1;
          };
      
          // Remove all the
          Ranger.prototype.clear = function() {
            this.view.panes.first().destroy();
            this.view.panes.create({
              title: this.panes[0][0],
              key: this.panes[0][1]
            });
          };
      
          Ranger.prototype.load = function(array)  {
            var i, id, item, key, length, main, map, out, title, x, j, alen, plen;
      
            // You can only have one top level pane at a time
            if (this.view.panes.length > 0) {
                this.view.panes.first().destroy();
            }
      
            map    = {};
            main   = {};
            length = this.panes.length - 1;
      
            // Loop through each item in the array - { object }
            for (i = 0, alen = array.length; i < alen; i += 1) {
      
                item = array[i];
                out  = main;
                x    = '';
      
                // Loop through each panel - [name, title]
                for (j = 0, plen = this.panes.length; j < plen; j += 1) {
      
                    title = this.panes[j][0];
                    key   = this.panes[j][1];
      
                    out.key = key;
                    out.title = title;
                    if (out.contents === undefined) {
                        out.contents = [];
                    }
      
                    x += title + ':' + item[key] + ':';
      
                    if (map[x] === undefined) {
                        id = out.contents.push({
                            title: item[key]
                        }) - 1;
                        map[x] = out.contents[id];
                    }
      
                    if (j !== length) {
      
                        if (map[x].child !== undefined) {
                            out = map[x].child;
                        } else {
                            out = map[x].child = {};
                        }
      
                    } else {
                        map[x].data = item;
                    }
                }
            }
            this.view.panes.create(main);
          };
      
          Ranger.prototype.add = function(object) {
            var first, itemData, self = this;
      
            // Add the item to the first pane
            first    = this.view.panes.first();
            itemData = this._addItem(object, first);
      
            // Recursive function
            var addPane = function (itemData) {
              var item, pane, index;
      
              item = itemData[0];
              pane = itemData[1];
              index = self.findPane(pane.key)
      
              if (index > -1 && ++index < self.panes.length) {
                pane = self.panes[index];
                item.child = new Pane({
                  title: pane[0],
                  key: pane[1]
                });
                item.child.parent = item;
                addPane(self._addItem(object, item.child));
              }
            }
      
            addPane(itemData);
      
          };
      
          Ranger.prototype._addItem = function(object, pane) {
            var key, value, item, data, exists, force, self = this;
            key = pane.key;
            value = object[key];
      
            force = this.findPane(pane.key) >= this.panes.length - 1;
      
            if (! force) {
              pane.contents.forEach(function (el) {
                if (! exists && el.title === value && el.child) {
                  exists = true;
                  data = self._addItem(object, el.child);
                }
              });
            }
      
            if (! exists || force) {
              item = pane.contents.create({
                title: value
              });
              if (force) item.data = object;
            }
      
            return data || [item, pane];
      
          };
      
          return Ranger;
      
        }());
      
        // Export global if we are running in a browser
        if (typeof global === 'undefined') {
            window.Ranger = Ranger;
        }
      
        module.exports = Ranger;
      
      }());;
      }
    ], [
      {
        /*
          /home/stayrad/Projects/Groovy/app/node_modules/ranger/lib/views/ranger.js
        */

        'base': 5,
        '../utils/bind': 6,
        '../templates/pane': 7,
        '../templates/item': 8,
        '../views/panes': 9,
        '../views/items': 10,
        '../models/pane': 11,
        '../models/item': 12
      }, function(require, module, exports) {
        /*jslint browser: true, node: true, nomen: true*/
      /*global $*/
      
      (function () {
      
          'use strict';
      
          var Base, Item, Items, Pane, Panes, Ranger, template, vent, bindAll;
      
          Base = require('base');
          bindAll = require('../utils/bind')
      
          // Global event passer
          vent = new Base.Event();
      
          // Templates
          template = {
              pane: require('../templates/pane'),
              item: require('../templates/item')
          };
      
          // Views and Models
          Panes = require('../views/panes')(vent, template.pane);
          Items = require('../views/items')(vent, template.item);
          Pane  = require('../models/pane');
          Item  = require('../models/item');
      
          Ranger = Base.View.extend({
      
              constructor: function () {
                  Ranger.__super__.constructor.apply(this, arguments);
                  bindAll(this);
      
                  this.current = {
                      pane: null,
                      item: null
                  };
      
                  this.panes = new Pane();
                  this.panes.on('create:model show', this.addOne);
                  this.panes.on('before:destroy:model', this.remove);
      
                  vent.on('select:item', this.selectItem);
                  vent.on('select:pane', this.selectPane);
      
              },
      
              // Select a pane
              selectPane: function (pane) {
                  this.current.pane = pane;
                  this.el.find('.active.pane').removeClass('active');
              },
      
              // Select an item
              selectItem: function (item, pane) {
                  this.current.item = item;
                  this.recheck(pane);
                  if (!item.child) {
                      return;
                  }
                  this.panes.trigger('show', item.child);
              },
      
              // Remove panes that aren't displayed
              recheck: function (pane) {
                  var _this = this;
                  return pane.contents.forEach(function (item) {
                      if (!item.child) {
                          return;
                      }
                      item.child.trigger('remove');
                      _this.recheck(item.child);
                  });
              },
      
              // Render a pane
              addOne: function (pane) {
                  var view;
                  view = new Panes({
                      pane: pane
                  });
                  this.el.append(view.render().el);
              },
      
              // Destroying the view of a pane when the model is destroyed
              // Also destroy all child views
              remove: function (pane) {
                  pane.trigger('remove');
                  this.recheck(pane);
              },
      
              // Select the first item in the first pane
              selectFirst: function () {
                  var item, pane;
                  pane = this.panes.first();
                  item = pane.contents.first();
                  pane.contents.trigger('click:item', item);
              },
      
              // Move up
              up: function () {
                  if (!this.current.pane) {
                      return this.selectFirst();
                  }
                  this.current.pane.trigger('move:up');
              },
      
              // Move down
              down: function () {
                  if (!this.current.pane) {
                      return this.selectFirst();
                  }
                  this.current.pane.trigger('move:down');
              },
      
              // Move right
              right: function () {
                  if (!this.current.pane) {
                      return;
                  }
                  this.current.pane.trigger('move:right');
              },
      
              // Move left
              left: function () {
                  var item, pane, _ref;
                  if (!((_ref = this.current.pane) !== undefined ? _ref.parent : undefined)) {
                      return;
                  }
                  item = this.current.pane.parent;
                  pane = item.collection;
                  pane.trigger('click:item', item);
              },
      
              // Return the selcted item
              open: function () {
                  return this.current.item.data;
              }
      
          });
      
          module.exports = Ranger;
      
      }());
      ;
      }
    ], [
      {
        /*
          /home/stayrad/Projects/Ranger/node_modules/base/index.js
        */

      }, function(require, module, exports) {
        /*jslint node: true, nomen: true*/
      
      (function () {
          'use strict';
      
          var include, extend, inherit, View, Event, Model, Collection;
      
          // Copy object properties
          include = function (to, from) {
              var key;
              for (key in from) {
                  if (from.hasOwnProperty(key)) {
                      to[key] = from[key];
                  }
              }
          };
      
          // CoffeeScript extend for classes
          inherit = function (child, parent) {
              var key, Klass;
              for (key in parent) {
                  if (parent.hasOwnProperty(key)) {
                      child[key] = parent[key];
                  }
              }
              Klass = function () {
                  this.constructor = child;
              };
              Klass.prototype = parent.prototype;
              child.prototype = new Klass();
              child.__super__ = parent.prototype;
              return child;
          };
      
          // Backbone like extending
          extend = function (attrs) {
              var child, parent = this;
              if (!attrs) { attrs = {}; }
              if (attrs.hasOwnProperty('constructor')) {
                  child = attrs.constructor;
              } else {
                  child = function () {
                      child.__super__.constructor.apply(this, arguments);
                  };
              }
              inherit(child, parent);
              include(child.prototype, attrs);
              return child;
          };
      
      
          /*
           * EVENT
           */
      
          Event = (function () {
      
              function Event(attrs) {
                  this._events = {};
                  this._listening = [];
              }
      
              // Bind an event to a function
              // Returns an event ID so you can unbind it later
              Event.prototype.on = function (events, fn) {
                  var ids, id, i, len, event;
                  if (typeof fn !== 'function') {
                      throw new Error('fn not function');
                  }
      
                  // Allow multiple events to be set at once such as:
                  // event.on('update change refresh', this.render);
                  ids = [];
                  events = events.split(' ');
                  for (i = 0, len = events.length; i < len; i += 1) {
                      event = events[i];
                      // If the event has never been listened to before
                      if (!this._events[event]) {
                          this._events[event] = {};
                          this._events[event].index = 0;
                      }
                      // Increment the index and assign an ID
                      id = this._events[event].index += 1;
                      this._events[event][id] = fn;
                      ids.push(id);
                  }
      
                  return ids;
              };
      
              // Trigger an event
              Event.prototype.trigger = function (event) {
                  var args, actions, i;
                  args = 2 <= arguments.length ? [].slice.call(arguments, 1) : [];
      
                  // Listen to all events
                  if (event !== '*') {
                      this.trigger('*', event, args);
                  }
      
                  actions = this._events[event];
                  if (actions) {
                      for (i in actions) {
                          if (actions.hasOwnProperty(i) && i !== 'index') {
                              actions[i].apply(actions[i], args);
                          }
                      }
                  }
              };
      
              // Remove a listener from an event
              Event.prototype.off = function (events, id) {
                  var i, len;
                  if (Array.isArray(id)) {
                      for (i = 0, len = id.length; i < len; i += 1) {
                          this.off(events, id[i]);
                      }
                      return;
                  }
                  events = events.split(' ');
                  for (i = 0, len = events.length; i < len; i += 1) {
                      delete this._events[events[i]][id];
                  }
              };
      
              /**
               * Listen to multiple events from multiple objects
               * Use this.stopListening to stop listening to them all
               *
               * Example:
               *
               *   this.listen(object, {
               *      'create change': this.render,
               *      'remove': this.remove
               *   });
               *
               *   this.listen([
               *      objectOne, {
               *          'create': this.render,
               *          'remove': this.remove
               *      },
               *      objectTwo, {
               *          'change': 'this.render
               *      }
               *   ]);
               *
               */
              Event.prototype.listen = function (obj, attrs) {
                  var i, len, event, listener;
                  if (Array.isArray(obj)) {
                      for (i = 0, len = obj.length; i < len; i += 2) {
                          this.listen(obj[i], obj[i + 1]);
                      }
                      return;
                  }
                  listener = [obj, {}];
                  for (event in attrs) {
                      if (attrs.hasOwnProperty(event)) {
                          listener[1][event] = obj.on(event, attrs[event]);
                      }
                  }
                  this._listening.push(listener);
              };
      
              // Stop listening to all events
              Event.prototype.stopListening = function (object) {
                  var i, len, obj, events, event;
                  for (i = 0, len = this._listening.length; i < len; i += 1) {
                      obj = this._listening[i][0];
                      if (!object || object === obj) {
                          events = this._listening[i][1];
                          for (event in events) {
                              if (events.hasOwnProperty(event)) {
                                  obj.off(event, events[event]);
                              }
                          }
                      }
                  }
                  this._listening = [];
              };
      
              return Event;
      
          }());
      
      
          /*
           * VIEW
           */
      
          View = (function () {
      
              function View(attrs) {
                  View.__super__.constructor.apply(this, arguments);
                  include(this, attrs);
      
                  if (!this.elements) {
                      this.elements = {};
                  }
      
                  if (!this.events) {
                      this.events = {};
                  }
      
                  if (this.el) {
                      this.bind();
                  }
              }
      
              // Load Events
              inherit(View, Event);
      
              View.prototype.bind = function (el) {
                  var selector, query, action, split, name, event;
      
                  // If el is not specified use this.el
                  if (!el) { el = this.el; }
      
                  // Cache elements
                  for (selector in this.elements) {
                      if (this.elements.hasOwnProperty(selector)) {
                          name = this.elements[selector];
                          this[name] = el.find(selector);
                      }
                  }
      
                  // Bind events
                  for (query in this.events) {
                      if (this.events.hasOwnProperty(query)) {
                          action = this.events[query];
                          split = query.indexOf(' ') + 1;
                          event = query.slice(0, split || 9e9);
                          if (split > 0) {
                              selector = query.slice(split);
                              el.on(event, selector, this[action]);
                          } else {
                              el.on(event, this[action]);
                          }
                      }
                  }
      
              };
      
              View.prototype.unbind = function (el) {
                  var selector, query, action, split, name, event;
      
                  // If el is not specified use this.el
                  if (!el) { el = this.el; }
      
                  // Delete elements
                  for (selector in this.elements) {
                      if (this.elements.hasOwnProperty(selector)) {
                          name = this.elements[selector];
                          delete this[name];
                      }
                  }
      
                  // Unbind events
                  for (query in this.events) {
                      if (this.events.hasOwnProperty(query)) {
                          action = this.events[query];
                          split = query.indexOf(' ') + 1;
                          event = query.slice(0, split || 9e9);
                          if (split > 0) {
                              selector = query.slice(split);
                              el.off(event, selector);
                          } else {
                              el.off(event);
                          }
                      }
                  }
      
              };
      
              // Unbind the view and remove the element
              View.prototype.release = function () {
                  this.unbind();
                  this.el.remove();
                  this.stopListening();
              };
      
              return View;
      
          }());
      
      
          /*
           * MODEL
           */
      
          Model = (function () {
      
              function Model(attrs) {
                  var set, get, key, self = this;
      
                  // Call super
                  Model.__super__.constructor.apply(this, arguments);
      
                  // Set attributes
                  if (!this.defaults) { this.defaults = {}; }
                  this._data = {};
                  include(this._data, this.defaults);
                  include(this._data, attrs);
      
                  set = function (key) {
                      return function (value) {
                          return self.set.call(self, key, value);
                      };
                  };
      
                  get = function (key) {
                      return function () {
                          return self.get(key);
                      };
                  };
      
                  for (key in this.defaults) {
                      if (this.defaults.hasOwnProperty(key)) {
                          this.__defineSetter__(key, set(key));
                          this.__defineGetter__(key, get(key));
                      }
                  }
      
              }
      
              // Load Events
              inherit(Model, Event);
      
              // Change a value
              Model.prototype.set = function (key, value, options) {
                  if (!this.defaults.hasOwnProperty(key)) {
                      this[key] = value;
                      return value;
                  }
                  if (value === this._data[key]) { return; }
                  this._data[key] = value;
                  if (!options || !options.silent) {
                      this.trigger('change', key, value);
                      this.trigger('change:' + key, value);
                  }
              };
      
              // Get a value
              Model.prototype.get = function (key) {
                  if (this.defaults.hasOwnProperty(key)) {
                      return this._data[key];
                  }
                  return this[key];
              };
      
              // Load data into the model
              Model.prototype.refresh = function (data, replace) {
                  if (replace) {
                      this._data = {};
                      include(this._data, this.defaults);
                  }
                  include(this._data, data);
                  this.trigger('refresh');
                  return this;
              };
      
              // Destroy the model
              Model.prototype.destroy = function () {
                  this.trigger('before:destroy');
                  delete this._data;
                  this.trigger('destroy');
                  return this;
              };
      
              // Convert the class instance into a simple object
              Model.prototype.toJSON = function (strict) {
                  var key, json;
                  if (strict) {
                      for (key in this.defaults) {
                          if (this.defaults.hasOwnProperty(key)) {
                              json[key] = this._data[key];
                          }
                      }
                  } else {
                      json = this._data;
                  }
                  return json;
              };
      
      
              return Model;
      
          }());
      
      
          /*
           * COLLECTION
           */
      
          Collection = (function () {
      
              function Collection() {
                  Collection.__super__.constructor.apply(this, arguments);
                  this.length  = 0;
                  this._index  = 0;
                  this._models = [];
                  this._lookup = {};
              }
      
              // Load Events
              inherit(Collection, Event);
      
              // Access all models
              Collection.prototype.all = function () {
                  return this._models;
              };
      
              // Create a new instance of the model and add it to the collection
              Collection.prototype.create = function (attrs, options) {
                  var model = new this.model(attrs);
                  this.add(model, options);
                  return model;
              };
      
              // Add a model to the collection
              Collection.prototype.add = function (model, options) {
      
                  var id, index, self = this;
      
                  // Set ID
                  if (model.id) {
                      id = model.id;
                  } else {
                      id = 'c-' + this._index;
                      this._index += 1;
                      model.set('id', id, {silent: true});
                  }
      
                  // Add to collection
                  model.collection = this;
                  index = this._models.push(model) - 1;
                  this._lookup[id] = index;
                  this.length += 1;
      
                  // Bubble events
                  this.listen(model, {
                      '*': function (event, args) {
                          args = args.slice(0);
                          args.unshift(event + ':model', model);
                          self.trigger.apply(self, args);
                      },
                      'before:destroy': function () {
                          self.remove(model);
                      }
                  });
      
                  // Only trigger create if silent is not set
                  if (!options || !options.silent) {
                      this.trigger('create:model', model);
                      this.trigger('change');
                  }
      
              };
      
              // Remove a model from the collection
              // Does not destroy the model - just removes it from the array
              Collection.prototype.remove = function (model) {
                  var index = this.indexOf(model);
                  this._models.splice(index, 1);
                  delete this._lookup[model.id];
                  this.length -= 1;
                  this.stopListening(model);
                  this.trigger('remove:model');
                  this.trigger('change');
              };
      
              // Reorder the collection
              Collection.prototype.move = function (model, pos) {
                  var index = this.indexOf(model);
                  this._models.splice(index, 1);
                  this._models.splice(pos, 0, model);
                  this._lookup[model.id] = index;
                  this.trigger('change:order');
                  this.trigger('change');
              };
      
              // Append or replace the data in the collection
              // Doesn't trigger any events when updating the array apart from 'refresh'
              Collection.prototype.refresh = function (data, replace) {
                  var i, len;
                  if (replace) {
                      this._models = [];
                      this._lookup = {};
                  }
                  for (i = 0, len = data.length; i < len; i += 1) {
                      this.create(data[i], { silent: true });
                  }
                  return this.trigger('refresh');
              };
      
              // Loop over each record in the collection
              Collection.prototype.forEach = function () {
                  return this._models.forEach.apply(this._models, arguments);
              };
      
              // Filter the models
              Collection.prototype.filter = function () {
                  return this._models.filter.apply(this._models, arguments);
              };
      
              // Sort the models. Does not alter original order
              Collection.prototype.sort = function () {
                  return this._models.sort.apply(this._models, arguments);
              };
      
              // Get the index of the item
              Collection.prototype.indexOf = function (model) {
                  if (typeof model === 'string') {
                      // Convert model id to actual model
                      return this.indexOf(this.get(model));
                  }
                  return this._models.indexOf(model);
              };
      
              // Convert the collection into an array of objects
              Collection.prototype.toJSON = function () {
                  var i, id, len, record, results = [];
                  for (i = 0, len = this._models.length; i < len; i += 1) {
                      record = this._models[i];
                      results.push(record.toJSON());
                  }
                  return results;
              };
      
              // Return the first record in the collection
              Collection.prototype.first = function () {
                  return this.at(0);
              };
      
              // Return the last record in the collection
              Collection.prototype.last = function () {
                  return this.at(this.length - 1);
              };
      
              // Return the record by the id
              Collection.prototype.get = function (id) {
                  var index = this._lookup[id];
                  return this.at(index);
              };
      
              // Return a specified record in the collection
              Collection.prototype.at = function (index) {
                  return this._models[index];
              };
      
              // Check if a model exists in the collection
              Collection.prototype.exists = function (model) {
                  return this.indexOf(model) > -1;
              };
      
              return Collection;
      
          }());
      
          // Add the extend to method to all classes
          Event.extend = View.extend = Model.extend = Collection.extend = extend;
      
          // Export all the classes
          module.exports = {
              Event: Event,
              View: View,
              Model: Model,
              Collection: Collection
          };
      
      }());
      ;
      }
    ], [
      {
        /*
          /home/stayrad/Projects/Groovy/app/node_modules/ranger/lib/utils/bind.js
        */

      }, function(require, module, exports) {
        (function () {
      
          'use strict';
      
          module.exports = function (me) {
              var key, proto = me.__proto__;
              for (key in proto) {
                  if (proto.hasOwnProperty(key) &&
                      key !== 'constructor' &&
                      typeof proto[key] === 'function') {
                      (function(key) {
                          me[key] = function () {
                              return proto[key].apply(me, arguments);
                          }
                      }(key));
                  }
              }
          };
      
      }());
      ;
      }
    ], [
      {
        /*
          /home/stayrad/Projects/Groovy/app/node_modules/ranger/lib/templates/pane.js
        */

      }, function(require, module, exports) {
        (function () {
      
          'use strict';
      
          module.exports = function (obj) {
              return '<div class=\"title\">' + obj.title + '</div><div class="items"></div>';
          };
      
      }());
      ;
      }
    ], [
      {
        /*
          /home/stayrad/Projects/Groovy/app/node_modules/ranger/lib/templates/item.js
        */

      }, function(require, module, exports) {
        (function () {
      
          'use strict';
      
          module.exports = function (obj) {
              return obj.title;
          };
      
      }());
      ;
      }
    ], [
      {
        /*
          /home/stayrad/Projects/Groovy/app/node_modules/ranger/lib/views/panes.js
        */

        'base': 5,
        '../views/items': 10,
        '../utils/bind': 6
      }, function(require, module, exports) {
        /*jslint browser: true, node: true, nomen: true*/
      /*global $*/
      
      (function () {
      
          'use strict';
      
          var Base, Items, bindAll, Panes, template, vent, SCROLL_OFFSET, SCROLL_HEIGHT;
      
          Base  = require('base');
          Items = require('../views/items')();
          bindAll = require('../utils/bind');
      
          // Constants
          // TODO: Let the user set these
          SCROLL_OFFSET = 20;
          SCROLL_HEIGHT = 50;
      
          // Set globals
          module.exports = function (vnt, tmpl) {
              if (vent === undefined) { vent = vnt; }
              if (template === undefined) { template = tmpl; }
              return Panes;
          };
      
          Panes = Base.View.extend({
      
              tagName: 'section',
      
              className: 'pane',
      
              constructor: function () {
                  Panes.__super__.constructor.apply(this, arguments);
                  bindAll(this);
      
                  this.el = $("<" + this.tagName + " class=\"" + this.className + "\">");
                  this.active = null;
      
                  this.listen([
                      this.pane, {
                          'remove':     this.remove,
                          'move:up':    this.up,
                          'move:down':  this.down,
                          'move:right': this.right
                      },
                      this.pane.contents, {
                          'click:item': this.select,
                          'create:model': this.addOne
                      }
                  ]);
      
              },
      
              remove: function () {
                  this.pane.contents.trigger('remove');
                  this.unbind();
                  this.el.remove();
                  delete this.el;
                  delete this.items;
                  this.stopListening();
              },
      
              updateScrollbar: function () {
                  var item, parent, height, pos, scroll;
                  item   = this.el.find('.active').get(0);
                  parent = this.items.get(0);
                  height = parent.offsetHeight;
                  pos    = item.offsetTop;
                  scroll = parent.scrollTop;
                  if (pos - scroll < SCROLL_OFFSET) {
                      parent.scrollTop = pos - SCROLL_OFFSET;
                  } else if (pos + SCROLL_HEIGHT > scroll + height - SCROLL_OFFSET) {
                      parent.scrollTop = pos - height + SCROLL_HEIGHT + SCROLL_OFFSET;
                  }
              },
      
              select: function (item) {
                  vent.trigger('select:pane', this.pane);
                  this.active = this.pane.contents.indexOf(item);
                  this.el.addClass('active');
                  this.el.find('.active').removeClass('active');
                  item.trigger('select');
                  vent.trigger('select:item', item, this.pane);
                  this.updateScrollbar();
              },
      
              render: function () {
                  this.el.html(template(this.pane.toJSON()));
                  this.items = this.el.find('.items');
                  this.pane.contents.forEach(this.addOne);
                  return this;
              },
      
              addOne: function (item) {
                  var itemView;
                  itemView = new Items({
                      item: item
                  });
                  this.items.append(itemView.render().el);
              },
      
              move: function (direction) {
                  var active, contents, item, max;
                  active = this.active;
                  contents = this.pane.contents;
                  active += direction;
                  max = contents.length - 1;
      
                  if (active < 0) {
                      active = 0;
                  } else if (active > max) {
                      active = max;
                  }
      
                  if (active === this.active) { return; }
      
                  this.active = active;
                  item = contents.at(this.active);
                  this.select(item);
              },
      
              up: function () {
                  this.move(-1);
              },
      
              down: function () {
                  this.move(1);
              },
      
              right: function () {
                  var child, current, item;
                  current = this.pane.contents.at(this.active);
                  if (!current.child) { return; }
                  child = current.child.contents;
                  item = child.first();
                  child.trigger('click:item', item);
              }
      
          });
      
      }());
      ;
      }
    ], [
      {
        /*
          /home/stayrad/Projects/Groovy/app/node_modules/ranger/lib/views/items.js
        */

        'base': 5,
        '../utils/bind': 6
      }, function(require, module, exports) {
        /*jslint browser: true, node: true, nomen: true*/
      /*global $*/
      
      (function () {
      
          'use strict';
      
          var Base, Items, template, vent, bindAll;
      
          Base = require('base');
          bindAll = require('../utils/bind');
      
          // Set globals
          module.exports = function (vnt, tmpl) {
              if (vent === undefined) { vent = vnt; }
              if (template === undefined) { template = tmpl; }
              window.TEMPLATE = template;
              return Items;
          };
      
          Items = Base.View.extend({
      
              tagName: 'div',
              className: 'item',
      
              events: {
                  'mousedown': 'click'
              },
      
              constructor: function () {
                  Items.__super__.constructor.apply(this, arguments);
                  bindAll(this);
      
                  this.el = $("<" + this.tagName + " class=\"" + this.className + "\">");
                  this.bind();
      
                  this.listen([
                      this.item, {
                          'select': this.select,
                          'change:child': this.render
                      },
                      this.item.collection, {
                          'remove': this.remove
                      }
                  ]);
              },
      
              render: function () {
                  this.el.html(template(this.item.toJSON()));
                  this.el.toggleClass('hasChild', !!this.item.child);
                  return this;
              },
      
              remove: function () {
                  this.unbind();
                  this.el.remove();
                  delete this.el;
                  this.stopListening();
              },
      
              // Sending message to pane view
              click: function () {
                  this.item.collection.trigger('click:item', this.item);
              },
      
              // Receiving message from pane view
              select: function () {
                  this.el.addClass('active');
              }
      
          });
      
      }());
      ;
      }
    ], [
      {
        /*
          /home/stayrad/Projects/Groovy/app/node_modules/ranger/lib/models/pane.js
        */

        'base': 5,
        '../models/item': 12
      }, function(require, module, exports) {
        /*jslint browser: true, node: true, nomen: true*/
      
      (function () {
      
          'use strict';
      
          var Base, Item, Pane, Panes;
      
          Base = require('base');
          Item = require('../models/item');
      
          Pane = Base.Model.extend({
      
              defaults: {
                  title: '',
                  key: '',
                  contents: null
              },
      
              constructor: function (attrs) {
                  Pane.__super__.constructor.apply(this, arguments);
                  this.contents = new Item();
                  if (attrs.contents) {
                      this.contents.refresh(attrs.contents, true);
                  }
              }
      
          });
      
          Panes = Base.Collection.extend({
      
              constructor: function () {
                  return Panes.__super__.constructor.apply(this, arguments);
              },
      
              model: Pane
      
          });
      
          module.exports = Panes;
      
      }());
      ;
      }
    ], [
      {
        /*
          /home/stayrad/Projects/Groovy/app/node_modules/ranger/lib/models/item.js
        */

        'base': 5,
        '../models/pane': 11
      }, function(require, module, exports) {
        /*jslint browser: true, node: true, nomen: true*/
      
      (function () {
      
          'use strict';
      
          var Base, Item, Items;
      
          Base = require('base');
      
          // Item Model
          Item = Base.Model.extend({
      
              defaults: {
                  title: '',
                  child: false,
                  data: false
              },
      
              constructor: function (attrs) {
                  var Pane;
                  Item.__super__.constructor.apply(this, arguments);
                  if (attrs.child === undefined) {
                      return;
                  }
                  Pane = require('../models/pane').prototype.model;
                  this.child = new Pane(attrs.child);
                  this.child.parent = this;
              }
      
          });
      
      
          // Item Collection
          Items = Base.Collection.extend({
      
              constructor: function () {
                  return Items.__super__.constructor.apply(this, arguments);
              },
      
              model: Item
      
          });
      
          module.exports = Items;
      
      }());
      ;
      }
    ], [
      {
        /*
          /home/stayrad/Projects/Groovy/app/node_modules/jqueryify/index.js
        */

      }, function(require, module, exports) {
        /*!
       * jQuery JavaScript Library v2.0.3
       * http://jquery.com/
       *
       * Includes Sizzle.js
       * http://sizzlejs.com/
       *
       * Copyright 2005, 2013 jQuery Foundation, Inc. and other contributors
       * Released under the MIT license
       * http://jquery.org/license
       *
       * Date: 2013-07-03T13:30Z
       */
      (function( window, undefined ) {
      
      // Can't do this because several apps including ASP.NET trace
      // the stack via arguments.caller.callee and Firefox dies if
      // you try to trace through "use strict" call chains. (#13335)
      // Support: Firefox 18+
      //"use strict";
      var
      	// A central reference to the root jQuery(document)
      	rootjQuery,
      
      	// The deferred used on DOM ready
      	readyList,
      
      	// Support: IE9
      	// For `typeof xmlNode.method` instead of `xmlNode.method !== undefined`
      	core_strundefined = typeof undefined,
      
      	// Use the correct document accordingly with window argument (sandbox)
      	location = window.location,
      	document = window.document,
      	docElem = document.documentElement,
      
      	// Map over jQuery in case of overwrite
      	_jQuery = window.jQuery,
      
      	// Map over the $ in case of overwrite
      	_$ = window.$,
      
      	// [[Class]] -> type pairs
      	class2type = {},
      
      	// List of deleted data cache ids, so we can reuse them
      	core_deletedIds = [],
      
      	core_version = "2.0.3",
      
      	// Save a reference to some core methods
      	core_concat = core_deletedIds.concat,
      	core_push = core_deletedIds.push,
      	core_slice = core_deletedIds.slice,
      	core_indexOf = core_deletedIds.indexOf,
      	core_toString = class2type.toString,
      	core_hasOwn = class2type.hasOwnProperty,
      	core_trim = core_version.trim,
      
      	// Define a local copy of jQuery
      	jQuery = function( selector, context ) {
      		// The jQuery object is actually just the init constructor 'enhanced'
      		return new jQuery.fn.init( selector, context, rootjQuery );
      	},
      
      	// Used for matching numbers
      	core_pnum = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,
      
      	// Used for splitting on whitespace
      	core_rnotwhite = /\S+/g,
      
      	// A simple way to check for HTML strings
      	// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
      	// Strict HTML recognition (#11290: must start with <)
      	rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,
      
      	// Match a standalone tag
      	rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
      
      	// Matches dashed string for camelizing
      	rmsPrefix = /^-ms-/,
      	rdashAlpha = /-([\da-z])/gi,
      
      	// Used by jQuery.camelCase as callback to replace()
      	fcamelCase = function( all, letter ) {
      		return letter.toUpperCase();
      	},
      
      	// The ready event handler and self cleanup method
      	completed = function() {
      		document.removeEventListener( "DOMContentLoaded", completed, false );
      		window.removeEventListener( "load", completed, false );
      		jQuery.ready();
      	};
      
      jQuery.fn = jQuery.prototype = {
      	// The current version of jQuery being used
      	jquery: core_version,
      
      	constructor: jQuery,
      	init: function( selector, context, rootjQuery ) {
      		var match, elem;
      
      		// HANDLE: $(""), $(null), $(undefined), $(false)
      		if ( !selector ) {
      			return this;
      		}
      
      		// Handle HTML strings
      		if ( typeof selector === "string" ) {
      			if ( selector.charAt(0) === "<" && selector.charAt( selector.length - 1 ) === ">" && selector.length >= 3 ) {
      				// Assume that strings that start and end with <> are HTML and skip the regex check
      				match = [ null, selector, null ];
      
      			} else {
      				match = rquickExpr.exec( selector );
      			}
      
      			// Match html or make sure no context is specified for #id
      			if ( match && (match[1] || !context) ) {
      
      				// HANDLE: $(html) -> $(array)
      				if ( match[1] ) {
      					context = context instanceof jQuery ? context[0] : context;
      
      					// scripts is true for back-compat
      					jQuery.merge( this, jQuery.parseHTML(
      						match[1],
      						context && context.nodeType ? context.ownerDocument || context : document,
      						true
      					) );
      
      					// HANDLE: $(html, props)
      					if ( rsingleTag.test( match[1] ) && jQuery.isPlainObject( context ) ) {
      						for ( match in context ) {
      							// Properties of context are called as methods if possible
      							if ( jQuery.isFunction( this[ match ] ) ) {
      								this[ match ]( context[ match ] );
      
      							// ...and otherwise set as attributes
      							} else {
      								this.attr( match, context[ match ] );
      							}
      						}
      					}
      
      					return this;
      
      				// HANDLE: $(#id)
      				} else {
      					elem = document.getElementById( match[2] );
      
      					// Check parentNode to catch when Blackberry 4.6 returns
      					// nodes that are no longer in the document #6963
      					if ( elem && elem.parentNode ) {
      						// Inject the element directly into the jQuery object
      						this.length = 1;
      						this[0] = elem;
      					}
      
      					this.context = document;
      					this.selector = selector;
      					return this;
      				}
      
      			// HANDLE: $(expr, $(...))
      			} else if ( !context || context.jquery ) {
      				return ( context || rootjQuery ).find( selector );
      
      			// HANDLE: $(expr, context)
      			// (which is just equivalent to: $(context).find(expr)
      			} else {
      				return this.constructor( context ).find( selector );
      			}
      
      		// HANDLE: $(DOMElement)
      		} else if ( selector.nodeType ) {
      			this.context = this[0] = selector;
      			this.length = 1;
      			return this;
      
      		// HANDLE: $(function)
      		// Shortcut for document ready
      		} else if ( jQuery.isFunction( selector ) ) {
      			return rootjQuery.ready( selector );
      		}
      
      		if ( selector.selector !== undefined ) {
      			this.selector = selector.selector;
      			this.context = selector.context;
      		}
      
      		return jQuery.makeArray( selector, this );
      	},
      
      	// Start with an empty selector
      	selector: "",
      
      	// The default length of a jQuery object is 0
      	length: 0,
      
      	toArray: function() {
      		return core_slice.call( this );
      	},
      
      	// Get the Nth element in the matched element set OR
      	// Get the whole matched element set as a clean array
      	get: function( num ) {
      		return num == null ?
      
      			// Return a 'clean' array
      			this.toArray() :
      
      			// Return just the object
      			( num < 0 ? this[ this.length + num ] : this[ num ] );
      	},
      
      	// Take an array of elements and push it onto the stack
      	// (returning the new matched element set)
      	pushStack: function( elems ) {
      
      		// Build a new jQuery matched element set
      		var ret = jQuery.merge( this.constructor(), elems );
      
      		// Add the old object onto the stack (as a reference)
      		ret.prevObject = this;
      		ret.context = this.context;
      
      		// Return the newly-formed element set
      		return ret;
      	},
      
      	// Execute a callback for every element in the matched set.
      	// (You can seed the arguments with an array of args, but this is
      	// only used internally.)
      	each: function( callback, args ) {
      		return jQuery.each( this, callback, args );
      	},
      
      	ready: function( fn ) {
      		// Add the callback
      		jQuery.ready.promise().done( fn );
      
      		return this;
      	},
      
      	slice: function() {
      		return this.pushStack( core_slice.apply( this, arguments ) );
      	},
      
      	first: function() {
      		return this.eq( 0 );
      	},
      
      	last: function() {
      		return this.eq( -1 );
      	},
      
      	eq: function( i ) {
      		var len = this.length,
      			j = +i + ( i < 0 ? len : 0 );
      		return this.pushStack( j >= 0 && j < len ? [ this[j] ] : [] );
      	},
      
      	map: function( callback ) {
      		return this.pushStack( jQuery.map(this, function( elem, i ) {
      			return callback.call( elem, i, elem );
      		}));
      	},
      
      	end: function() {
      		return this.prevObject || this.constructor(null);
      	},
      
      	// For internal use only.
      	// Behaves like an Array's method, not like a jQuery method.
      	push: core_push,
      	sort: [].sort,
      	splice: [].splice
      };
      
      // Give the init function the jQuery prototype for later instantiation
      jQuery.fn.init.prototype = jQuery.fn;
      
      jQuery.extend = jQuery.fn.extend = function() {
      	var options, name, src, copy, copyIsArray, clone,
      		target = arguments[0] || {},
      		i = 1,
      		length = arguments.length,
      		deep = false;
      
      	// Handle a deep copy situation
      	if ( typeof target === "boolean" ) {
      		deep = target;
      		target = arguments[1] || {};
      		// skip the boolean and the target
      		i = 2;
      	}
      
      	// Handle case when target is a string or something (possible in deep copy)
      	if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
      		target = {};
      	}
      
      	// extend jQuery itself if only one argument is passed
      	if ( length === i ) {
      		target = this;
      		--i;
      	}
      
      	for ( ; i < length; i++ ) {
      		// Only deal with non-null/undefined values
      		if ( (options = arguments[ i ]) != null ) {
      			// Extend the base object
      			for ( name in options ) {
      				src = target[ name ];
      				copy = options[ name ];
      
      				// Prevent never-ending loop
      				if ( target === copy ) {
      					continue;
      				}
      
      				// Recurse if we're merging plain objects or arrays
      				if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
      					if ( copyIsArray ) {
      						copyIsArray = false;
      						clone = src && jQuery.isArray(src) ? src : [];
      
      					} else {
      						clone = src && jQuery.isPlainObject(src) ? src : {};
      					}
      
      					// Never move original objects, clone them
      					target[ name ] = jQuery.extend( deep, clone, copy );
      
      				// Don't bring in undefined values
      				} else if ( copy !== undefined ) {
      					target[ name ] = copy;
      				}
      			}
      		}
      	}
      
      	// Return the modified object
      	return target;
      };
      
      jQuery.extend({
      	// Unique for each copy of jQuery on the page
      	expando: "jQuery" + ( core_version + Math.random() ).replace( /\D/g, "" ),
      
      	noConflict: function( deep ) {
      		if ( window.$ === jQuery ) {
      			window.$ = _$;
      		}
      
      		if ( deep && window.jQuery === jQuery ) {
      			window.jQuery = _jQuery;
      		}
      
      		return jQuery;
      	},
      
      	// Is the DOM ready to be used? Set to true once it occurs.
      	isReady: false,
      
      	// A counter to track how many items to wait for before
      	// the ready event fires. See #6781
      	readyWait: 1,
      
      	// Hold (or release) the ready event
      	holdReady: function( hold ) {
      		if ( hold ) {
      			jQuery.readyWait++;
      		} else {
      			jQuery.ready( true );
      		}
      	},
      
      	// Handle when the DOM is ready
      	ready: function( wait ) {
      
      		// Abort if there are pending holds or we're already ready
      		if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
      			return;
      		}
      
      		// Remember that the DOM is ready
      		jQuery.isReady = true;
      
      		// If a normal DOM Ready event fired, decrement, and wait if need be
      		if ( wait !== true && --jQuery.readyWait > 0 ) {
      			return;
      		}
      
      		// If there are functions bound, to execute
      		readyList.resolveWith( document, [ jQuery ] );
      
      		// Trigger any bound ready events
      		if ( jQuery.fn.trigger ) {
      			jQuery( document ).trigger("ready").off("ready");
      		}
      	},
      
      	// See test/unit/core.js for details concerning isFunction.
      	// Since version 1.3, DOM methods and functions like alert
      	// aren't supported. They return false on IE (#2968).
      	isFunction: function( obj ) {
      		return jQuery.type(obj) === "function";
      	},
      
      	isArray: Array.isArray,
      
      	isWindow: function( obj ) {
      		return obj != null && obj === obj.window;
      	},
      
      	isNumeric: function( obj ) {
      		return !isNaN( parseFloat(obj) ) && isFinite( obj );
      	},
      
      	type: function( obj ) {
      		if ( obj == null ) {
      			return String( obj );
      		}
      		// Support: Safari <= 5.1 (functionish RegExp)
      		return typeof obj === "object" || typeof obj === "function" ?
      			class2type[ core_toString.call(obj) ] || "object" :
      			typeof obj;
      	},
      
      	isPlainObject: function( obj ) {
      		// Not plain objects:
      		// - Any object or value whose internal [[Class]] property is not "[object Object]"
      		// - DOM nodes
      		// - window
      		if ( jQuery.type( obj ) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
      			return false;
      		}
      
      		// Support: Firefox <20
      		// The try/catch suppresses exceptions thrown when attempting to access
      		// the "constructor" property of certain host objects, ie. |window.location|
      		// https://bugzilla.mozilla.org/show_bug.cgi?id=814622
      		try {
      			if ( obj.constructor &&
      					!core_hasOwn.call( obj.constructor.prototype, "isPrototypeOf" ) ) {
      				return false;
      			}
      		} catch ( e ) {
      			return false;
      		}
      
      		// If the function hasn't returned already, we're confident that
      		// |obj| is a plain object, created by {} or constructed with new Object
      		return true;
      	},
      
      	isEmptyObject: function( obj ) {
      		var name;
      		for ( name in obj ) {
      			return false;
      		}
      		return true;
      	},
      
      	error: function( msg ) {
      		throw new Error( msg );
      	},
      
      	// data: string of html
      	// context (optional): If specified, the fragment will be created in this context, defaults to document
      	// keepScripts (optional): If true, will include scripts passed in the html string
      	parseHTML: function( data, context, keepScripts ) {
      		if ( !data || typeof data !== "string" ) {
      			return null;
      		}
      		if ( typeof context === "boolean" ) {
      			keepScripts = context;
      			context = false;
      		}
      		context = context || document;
      
      		var parsed = rsingleTag.exec( data ),
      			scripts = !keepScripts && [];
      
      		// Single tag
      		if ( parsed ) {
      			return [ context.createElement( parsed[1] ) ];
      		}
      
      		parsed = jQuery.buildFragment( [ data ], context, scripts );
      
      		if ( scripts ) {
      			jQuery( scripts ).remove();
      		}
      
      		return jQuery.merge( [], parsed.childNodes );
      	},
      
      	parseJSON: JSON.parse,
      
      	// Cross-browser xml parsing
      	parseXML: function( data ) {
      		var xml, tmp;
      		if ( !data || typeof data !== "string" ) {
      			return null;
      		}
      
      		// Support: IE9
      		try {
      			tmp = new DOMParser();
      			xml = tmp.parseFromString( data , "text/xml" );
      		} catch ( e ) {
      			xml = undefined;
      		}
      
      		if ( !xml || xml.getElementsByTagName( "parsererror" ).length ) {
      			jQuery.error( "Invalid XML: " + data );
      		}
      		return xml;
      	},
      
      	noop: function() {},
      
      	// Evaluates a script in a global context
      	globalEval: function( code ) {
      		var script,
      				indirect = eval;
      
      		code = jQuery.trim( code );
      
      		if ( code ) {
      			// If the code includes a valid, prologue position
      			// strict mode pragma, execute code by injecting a
      			// script tag into the document.
      			if ( code.indexOf("use strict") === 1 ) {
      				script = document.createElement("script");
      				script.text = code;
      				document.head.appendChild( script ).parentNode.removeChild( script );
      			} else {
      			// Otherwise, avoid the DOM node creation, insertion
      			// and removal by using an indirect global eval
      				indirect( code );
      			}
      		}
      	},
      
      	// Convert dashed to camelCase; used by the css and data modules
      	// Microsoft forgot to hump their vendor prefix (#9572)
      	camelCase: function( string ) {
      		return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
      	},
      
      	nodeName: function( elem, name ) {
      		return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
      	},
      
      	// args is for internal usage only
      	each: function( obj, callback, args ) {
      		var value,
      			i = 0,
      			length = obj.length,
      			isArray = isArraylike( obj );
      
      		if ( args ) {
      			if ( isArray ) {
      				for ( ; i < length; i++ ) {
      					value = callback.apply( obj[ i ], args );
      
      					if ( value === false ) {
      						break;
      					}
      				}
      			} else {
      				for ( i in obj ) {
      					value = callback.apply( obj[ i ], args );
      
      					if ( value === false ) {
      						break;
      					}
      				}
      			}
      
      		// A special, fast, case for the most common use of each
      		} else {
      			if ( isArray ) {
      				for ( ; i < length; i++ ) {
      					value = callback.call( obj[ i ], i, obj[ i ] );
      
      					if ( value === false ) {
      						break;
      					}
      				}
      			} else {
      				for ( i in obj ) {
      					value = callback.call( obj[ i ], i, obj[ i ] );
      
      					if ( value === false ) {
      						break;
      					}
      				}
      			}
      		}
      
      		return obj;
      	},
      
      	trim: function( text ) {
      		return text == null ? "" : core_trim.call( text );
      	},
      
      	// results is for internal usage only
      	makeArray: function( arr, results ) {
      		var ret = results || [];
      
      		if ( arr != null ) {
      			if ( isArraylike( Object(arr) ) ) {
      				jQuery.merge( ret,
      					typeof arr === "string" ?
      					[ arr ] : arr
      				);
      			} else {
      				core_push.call( ret, arr );
      			}
      		}
      
      		return ret;
      	},
      
      	inArray: function( elem, arr, i ) {
      		return arr == null ? -1 : core_indexOf.call( arr, elem, i );
      	},
      
      	merge: function( first, second ) {
      		var l = second.length,
      			i = first.length,
      			j = 0;
      
      		if ( typeof l === "number" ) {
      			for ( ; j < l; j++ ) {
      				first[ i++ ] = second[ j ];
      			}
      		} else {
      			while ( second[j] !== undefined ) {
      				first[ i++ ] = second[ j++ ];
      			}
      		}
      
      		first.length = i;
      
      		return first;
      	},
      
      	grep: function( elems, callback, inv ) {
      		var retVal,
      			ret = [],
      			i = 0,
      			length = elems.length;
      		inv = !!inv;
      
      		// Go through the array, only saving the items
      		// that pass the validator function
      		for ( ; i < length; i++ ) {
      			retVal = !!callback( elems[ i ], i );
      			if ( inv !== retVal ) {
      				ret.push( elems[ i ] );
      			}
      		}
      
      		return ret;
      	},
      
      	// arg is for internal usage only
      	map: function( elems, callback, arg ) {
      		var value,
      			i = 0,
      			length = elems.length,
      			isArray = isArraylike( elems ),
      			ret = [];
      
      		// Go through the array, translating each of the items to their
      		if ( isArray ) {
      			for ( ; i < length; i++ ) {
      				value = callback( elems[ i ], i, arg );
      
      				if ( value != null ) {
      					ret[ ret.length ] = value;
      				}
      			}
      
      		// Go through every key on the object,
      		} else {
      			for ( i in elems ) {
      				value = callback( elems[ i ], i, arg );
      
      				if ( value != null ) {
      					ret[ ret.length ] = value;
      				}
      			}
      		}
      
      		// Flatten any nested arrays
      		return core_concat.apply( [], ret );
      	},
      
      	// A global GUID counter for objects
      	guid: 1,
      
      	// Bind a function to a context, optionally partially applying any
      	// arguments.
      	proxy: function( fn, context ) {
      		var tmp, args, proxy;
      
      		if ( typeof context === "string" ) {
      			tmp = fn[ context ];
      			context = fn;
      			fn = tmp;
      		}
      
      		// Quick check to determine if target is callable, in the spec
      		// this throws a TypeError, but we will just return undefined.
      		if ( !jQuery.isFunction( fn ) ) {
      			return undefined;
      		}
      
      		// Simulated bind
      		args = core_slice.call( arguments, 2 );
      		proxy = function() {
      			return fn.apply( context || this, args.concat( core_slice.call( arguments ) ) );
      		};
      
      		// Set the guid of unique handler to the same of original handler, so it can be removed
      		proxy.guid = fn.guid = fn.guid || jQuery.guid++;
      
      		return proxy;
      	},
      
      	// Multifunctional method to get and set values of a collection
      	// The value/s can optionally be executed if it's a function
      	access: function( elems, fn, key, value, chainable, emptyGet, raw ) {
      		var i = 0,
      			length = elems.length,
      			bulk = key == null;
      
      		// Sets many values
      		if ( jQuery.type( key ) === "object" ) {
      			chainable = true;
      			for ( i in key ) {
      				jQuery.access( elems, fn, i, key[i], true, emptyGet, raw );
      			}
      
      		// Sets one value
      		} else if ( value !== undefined ) {
      			chainable = true;
      
      			if ( !jQuery.isFunction( value ) ) {
      				raw = true;
      			}
      
      			if ( bulk ) {
      				// Bulk operations run against the entire set
      				if ( raw ) {
      					fn.call( elems, value );
      					fn = null;
      
      				// ...except when executing function values
      				} else {
      					bulk = fn;
      					fn = function( elem, key, value ) {
      						return bulk.call( jQuery( elem ), value );
      					};
      				}
      			}
      
      			if ( fn ) {
      				for ( ; i < length; i++ ) {
      					fn( elems[i], key, raw ? value : value.call( elems[i], i, fn( elems[i], key ) ) );
      				}
      			}
      		}
      
      		return chainable ?
      			elems :
      
      			// Gets
      			bulk ?
      				fn.call( elems ) :
      				length ? fn( elems[0], key ) : emptyGet;
      	},
      
      	now: Date.now,
      
      	// A method for quickly swapping in/out CSS properties to get correct calculations.
      	// Note: this method belongs to the css module but it's needed here for the support module.
      	// If support gets modularized, this method should be moved back to the css module.
      	swap: function( elem, options, callback, args ) {
      		var ret, name,
      			old = {};
      
      		// Remember the old values, and insert the new ones
      		for ( name in options ) {
      			old[ name ] = elem.style[ name ];
      			elem.style[ name ] = options[ name ];
      		}
      
      		ret = callback.apply( elem, args || [] );
      
      		// Revert the old values
      		for ( name in options ) {
      			elem.style[ name ] = old[ name ];
      		}
      
      		return ret;
      	}
      });
      
      jQuery.ready.promise = function( obj ) {
      	if ( !readyList ) {
      
      		readyList = jQuery.Deferred();
      
      		// Catch cases where $(document).ready() is called after the browser event has already occurred.
      		// we once tried to use readyState "interactive" here, but it caused issues like the one
      		// discovered by ChrisS here: http://bugs.jquery.com/ticket/12282#comment:15
      		if ( document.readyState === "complete" ) {
      			// Handle it asynchronously to allow scripts the opportunity to delay ready
      			setTimeout( jQuery.ready );
      
      		} else {
      
      			// Use the handy event callback
      			document.addEventListener( "DOMContentLoaded", completed, false );
      
      			// A fallback to window.onload, that will always work
      			window.addEventListener( "load", completed, false );
      		}
      	}
      	return readyList.promise( obj );
      };
      
      // Populate the class2type map
      jQuery.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
      	class2type[ "[object " + name + "]" ] = name.toLowerCase();
      });
      
      function isArraylike( obj ) {
      	var length = obj.length,
      		type = jQuery.type( obj );
      
      	if ( jQuery.isWindow( obj ) ) {
      		return false;
      	}
      
      	if ( obj.nodeType === 1 && length ) {
      		return true;
      	}
      
      	return type === "array" || type !== "function" &&
      		( length === 0 ||
      		typeof length === "number" && length > 0 && ( length - 1 ) in obj );
      }
      
      // All jQuery objects should point back to these
      rootjQuery = jQuery(document);
      /*!
       * Sizzle CSS Selector Engine v1.9.4-pre
       * http://sizzlejs.com/
       *
       * Copyright 2013 jQuery Foundation, Inc. and other contributors
       * Released under the MIT license
       * http://jquery.org/license
       *
       * Date: 2013-06-03
       */
      (function( window, undefined ) {
      
      var i,
      	support,
      	cachedruns,
      	Expr,
      	getText,
      	isXML,
      	compile,
      	outermostContext,
      	sortInput,
      
      	// Local document vars
      	setDocument,
      	document,
      	docElem,
      	documentIsHTML,
      	rbuggyQSA,
      	rbuggyMatches,
      	matches,
      	contains,
      
      	// Instance-specific data
      	expando = "sizzle" + -(new Date()),
      	preferredDoc = window.document,
      	dirruns = 0,
      	done = 0,
      	classCache = createCache(),
      	tokenCache = createCache(),
      	compilerCache = createCache(),
      	hasDuplicate = false,
      	sortOrder = function( a, b ) {
      		if ( a === b ) {
      			hasDuplicate = true;
      			return 0;
      		}
      		return 0;
      	},
      
      	// General-purpose constants
      	strundefined = typeof undefined,
      	MAX_NEGATIVE = 1 << 31,
      
      	// Instance methods
      	hasOwn = ({}).hasOwnProperty,
      	arr = [],
      	pop = arr.pop,
      	push_native = arr.push,
      	push = arr.push,
      	slice = arr.slice,
      	// Use a stripped-down indexOf if we can't use a native one
      	indexOf = arr.indexOf || function( elem ) {
      		var i = 0,
      			len = this.length;
      		for ( ; i < len; i++ ) {
      			if ( this[i] === elem ) {
      				return i;
      			}
      		}
      		return -1;
      	},
      
      	booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",
      
      	// Regular expressions
      
      	// Whitespace characters http://www.w3.org/TR/css3-selectors/#whitespace
      	whitespace = "[\\x20\\t\\r\\n\\f]",
      	// http://www.w3.org/TR/css3-syntax/#characters
      	characterEncoding = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",
      
      	// Loosely modeled on CSS identifier characters
      	// An unquoted value should be a CSS identifier http://www.w3.org/TR/css3-selectors/#attribute-selectors
      	// Proper syntax: http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
      	identifier = characterEncoding.replace( "w", "w#" ),
      
      	// Acceptable operators http://www.w3.org/TR/selectors/#attribute-selectors
      	attributes = "\\[" + whitespace + "*(" + characterEncoding + ")" + whitespace +
      		"*(?:([*^$|!~]?=)" + whitespace + "*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|(" + identifier + ")|)|)" + whitespace + "*\\]",
      
      	// Prefer arguments quoted,
      	//   then not containing pseudos/brackets,
      	//   then attribute selectors/non-parenthetical expressions,
      	//   then anything else
      	// These preferences are here to reduce the number of selectors
      	//   needing tokenize in the PSEUDO preFilter
      	pseudos = ":(" + characterEncoding + ")(?:\\(((['\"])((?:\\\\.|[^\\\\])*?)\\3|((?:\\\\.|[^\\\\()[\\]]|" + attributes.replace( 3, 8 ) + ")*)|.*)\\)|)",
      
      	// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
      	rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),
      
      	rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
      	rcombinators = new RegExp( "^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*" ),
      
      	rsibling = new RegExp( whitespace + "*[+~]" ),
      	rattributeQuotes = new RegExp( "=" + whitespace + "*([^\\]'\"]*)" + whitespace + "*\\]", "g" ),
      
      	rpseudo = new RegExp( pseudos ),
      	ridentifier = new RegExp( "^" + identifier + "$" ),
      
      	matchExpr = {
      		"ID": new RegExp( "^#(" + characterEncoding + ")" ),
      		"CLASS": new RegExp( "^\\.(" + characterEncoding + ")" ),
      		"TAG": new RegExp( "^(" + characterEncoding.replace( "w", "w*" ) + ")" ),
      		"ATTR": new RegExp( "^" + attributes ),
      		"PSEUDO": new RegExp( "^" + pseudos ),
      		"CHILD": new RegExp( "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace +
      			"*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
      			"*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
      		"bool": new RegExp( "^(?:" + booleans + ")$", "i" ),
      		// For use in libraries implementing .is()
      		// We use this for POS matching in `select`
      		"needsContext": new RegExp( "^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
      			whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
      	},
      
      	rnative = /^[^{]+\{\s*\[native \w/,
      
      	// Easily-parseable/retrievable ID or TAG or CLASS selectors
      	rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,
      
      	rinputs = /^(?:input|select|textarea|button)$/i,
      	rheader = /^h\d$/i,
      
      	rescape = /'|\\/g,
      
      	// CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
      	runescape = new RegExp( "\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig" ),
      	funescape = function( _, escaped, escapedWhitespace ) {
      		var high = "0x" + escaped - 0x10000;
      		// NaN means non-codepoint
      		// Support: Firefox
      		// Workaround erroneous numeric interpretation of +"0x"
      		return high !== high || escapedWhitespace ?
      			escaped :
      			// BMP codepoint
      			high < 0 ?
      				String.fromCharCode( high + 0x10000 ) :
      				// Supplemental Plane codepoint (surrogate pair)
      				String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
      	};
      
      // Optimize for push.apply( _, NodeList )
      try {
      	push.apply(
      		(arr = slice.call( preferredDoc.childNodes )),
      		preferredDoc.childNodes
      	);
      	// Support: Android<4.0
      	// Detect silently failing push.apply
      	arr[ preferredDoc.childNodes.length ].nodeType;
      } catch ( e ) {
      	push = { apply: arr.length ?
      
      		// Leverage slice if possible
      		function( target, els ) {
      			push_native.apply( target, slice.call(els) );
      		} :
      
      		// Support: IE<9
      		// Otherwise append directly
      		function( target, els ) {
      			var j = target.length,
      				i = 0;
      			// Can't trust NodeList.length
      			while ( (target[j++] = els[i++]) ) {}
      			target.length = j - 1;
      		}
      	};
      }
      
      function Sizzle( selector, context, results, seed ) {
      	var match, elem, m, nodeType,
      		// QSA vars
      		i, groups, old, nid, newContext, newSelector;
      
      	if ( ( context ? context.ownerDocument || context : preferredDoc ) !== document ) {
      		setDocument( context );
      	}
      
      	context = context || document;
      	results = results || [];
      
      	if ( !selector || typeof selector !== "string" ) {
      		return results;
      	}
      
      	if ( (nodeType = context.nodeType) !== 1 && nodeType !== 9 ) {
      		return [];
      	}
      
      	if ( documentIsHTML && !seed ) {
      
      		// Shortcuts
      		if ( (match = rquickExpr.exec( selector )) ) {
      			// Speed-up: Sizzle("#ID")
      			if ( (m = match[1]) ) {
      				if ( nodeType === 9 ) {
      					elem = context.getElementById( m );
      					// Check parentNode to catch when Blackberry 4.6 returns
      					// nodes that are no longer in the document #6963
      					if ( elem && elem.parentNode ) {
      						// Handle the case where IE, Opera, and Webkit return items
      						// by name instead of ID
      						if ( elem.id === m ) {
      							results.push( elem );
      							return results;
      						}
      					} else {
      						return results;
      					}
      				} else {
      					// Context is not a document
      					if ( context.ownerDocument && (elem = context.ownerDocument.getElementById( m )) &&
      						contains( context, elem ) && elem.id === m ) {
      						results.push( elem );
      						return results;
      					}
      				}
      
      			// Speed-up: Sizzle("TAG")
      			} else if ( match[2] ) {
      				push.apply( results, context.getElementsByTagName( selector ) );
      				return results;
      
      			// Speed-up: Sizzle(".CLASS")
      			} else if ( (m = match[3]) && support.getElementsByClassName && context.getElementsByClassName ) {
      				push.apply( results, context.getElementsByClassName( m ) );
      				return results;
      			}
      		}
      
      		// QSA path
      		if ( support.qsa && (!rbuggyQSA || !rbuggyQSA.test( selector )) ) {
      			nid = old = expando;
      			newContext = context;
      			newSelector = nodeType === 9 && selector;
      
      			// qSA works strangely on Element-rooted queries
      			// We can work around this by specifying an extra ID on the root
      			// and working up from there (Thanks to Andrew Dupont for the technique)
      			// IE 8 doesn't work on object elements
      			if ( nodeType === 1 && context.nodeName.toLowerCase() !== "object" ) {
      				groups = tokenize( selector );
      
      				if ( (old = context.getAttribute("id")) ) {
      					nid = old.replace( rescape, "\\$&" );
      				} else {
      					context.setAttribute( "id", nid );
      				}
      				nid = "[id='" + nid + "'] ";
      
      				i = groups.length;
      				while ( i-- ) {
      					groups[i] = nid + toSelector( groups[i] );
      				}
      				newContext = rsibling.test( selector ) && context.parentNode || context;
      				newSelector = groups.join(",");
      			}
      
      			if ( newSelector ) {
      				try {
      					push.apply( results,
      						newContext.querySelectorAll( newSelector )
      					);
      					return results;
      				} catch(qsaError) {
      				} finally {
      					if ( !old ) {
      						context.removeAttribute("id");
      					}
      				}
      			}
      		}
      	}
      
      	// All others
      	return select( selector.replace( rtrim, "$1" ), context, results, seed );
      }
      
      /**
       * Create key-value caches of limited size
       * @returns {Function(string, Object)} Returns the Object data after storing it on itself with
       *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
       *	deleting the oldest entry
       */
      function createCache() {
      	var keys = [];
      
      	function cache( key, value ) {
      		// Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
      		if ( keys.push( key += " " ) > Expr.cacheLength ) {
      			// Only keep the most recent entries
      			delete cache[ keys.shift() ];
      		}
      		return (cache[ key ] = value);
      	}
      	return cache;
      }
      
      /**
       * Mark a function for special use by Sizzle
       * @param {Function} fn The function to mark
       */
      function markFunction( fn ) {
      	fn[ expando ] = true;
      	return fn;
      }
      
      /**
       * Support testing using an element
       * @param {Function} fn Passed the created div and expects a boolean result
       */
      function assert( fn ) {
      	var div = document.createElement("div");
      
      	try {
      		return !!fn( div );
      	} catch (e) {
      		return false;
      	} finally {
      		// Remove from its parent by default
      		if ( div.parentNode ) {
      			div.parentNode.removeChild( div );
      		}
      		// release memory in IE
      		div = null;
      	}
      }
      
      /**
       * Adds the same handler for all of the specified attrs
       * @param {String} attrs Pipe-separated list of attributes
       * @param {Function} handler The method that will be applied
       */
      function addHandle( attrs, handler ) {
      	var arr = attrs.split("|"),
      		i = attrs.length;
      
      	while ( i-- ) {
      		Expr.attrHandle[ arr[i] ] = handler;
      	}
      }
      
      /**
       * Checks document order of two siblings
       * @param {Element} a
       * @param {Element} b
       * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
       */
      function siblingCheck( a, b ) {
      	var cur = b && a,
      		diff = cur && a.nodeType === 1 && b.nodeType === 1 &&
      			( ~b.sourceIndex || MAX_NEGATIVE ) -
      			( ~a.sourceIndex || MAX_NEGATIVE );
      
      	// Use IE sourceIndex if available on both nodes
      	if ( diff ) {
      		return diff;
      	}
      
      	// Check if b follows a
      	if ( cur ) {
      		while ( (cur = cur.nextSibling) ) {
      			if ( cur === b ) {
      				return -1;
      			}
      		}
      	}
      
      	return a ? 1 : -1;
      }
      
      /**
       * Returns a function to use in pseudos for input types
       * @param {String} type
       */
      function createInputPseudo( type ) {
      	return function( elem ) {
      		var name = elem.nodeName.toLowerCase();
      		return name === "input" && elem.type === type;
      	};
      }
      
      /**
       * Returns a function to use in pseudos for buttons
       * @param {String} type
       */
      function createButtonPseudo( type ) {
      	return function( elem ) {
      		var name = elem.nodeName.toLowerCase();
      		return (name === "input" || name === "button") && elem.type === type;
      	};
      }
      
      /**
       * Returns a function to use in pseudos for positionals
       * @param {Function} fn
       */
      function createPositionalPseudo( fn ) {
      	return markFunction(function( argument ) {
      		argument = +argument;
      		return markFunction(function( seed, matches ) {
      			var j,
      				matchIndexes = fn( [], seed.length, argument ),
      				i = matchIndexes.length;
      
      			// Match elements found at the specified indexes
      			while ( i-- ) {
      				if ( seed[ (j = matchIndexes[i]) ] ) {
      					seed[j] = !(matches[j] = seed[j]);
      				}
      			}
      		});
      	});
      }
      
      /**
       * Detect xml
       * @param {Element|Object} elem An element or a document
       */
      isXML = Sizzle.isXML = function( elem ) {
      	// documentElement is verified for cases where it doesn't yet exist
      	// (such as loading iframes in IE - #4833)
      	var documentElement = elem && (elem.ownerDocument || elem).documentElement;
      	return documentElement ? documentElement.nodeName !== "HTML" : false;
      };
      
      // Expose support vars for convenience
      support = Sizzle.support = {};
      
      /**
       * Sets document-related variables once based on the current document
       * @param {Element|Object} [doc] An element or document object to use to set the document
       * @returns {Object} Returns the current document
       */
      setDocument = Sizzle.setDocument = function( node ) {
      	var doc = node ? node.ownerDocument || node : preferredDoc,
      		parent = doc.defaultView;
      
      	// If no document and documentElement is available, return
      	if ( doc === document || doc.nodeType !== 9 || !doc.documentElement ) {
      		return document;
      	}
      
      	// Set our document
      	document = doc;
      	docElem = doc.documentElement;
      
      	// Support tests
      	documentIsHTML = !isXML( doc );
      
      	// Support: IE>8
      	// If iframe document is assigned to "document" variable and if iframe has been reloaded,
      	// IE will throw "permission denied" error when accessing "document" variable, see jQuery #13936
      	// IE6-8 do not support the defaultView property so parent will be undefined
      	if ( parent && parent.attachEvent && parent !== parent.top ) {
      		parent.attachEvent( "onbeforeunload", function() {
      			setDocument();
      		});
      	}
      
      	/* Attributes
      	---------------------------------------------------------------------- */
      
      	// Support: IE<8
      	// Verify that getAttribute really returns attributes and not properties (excepting IE8 booleans)
      	support.attributes = assert(function( div ) {
      		div.className = "i";
      		return !div.getAttribute("className");
      	});
      
      	/* getElement(s)By*
      	---------------------------------------------------------------------- */
      
      	// Check if getElementsByTagName("*") returns only elements
      	support.getElementsByTagName = assert(function( div ) {
      		div.appendChild( doc.createComment("") );
      		return !div.getElementsByTagName("*").length;
      	});
      
      	// Check if getElementsByClassName can be trusted
      	support.getElementsByClassName = assert(function( div ) {
      		div.innerHTML = "<div class='a'></div><div class='a i'></div>";
      
      		// Support: Safari<4
      		// Catch class over-caching
      		div.firstChild.className = "i";
      		// Support: Opera<10
      		// Catch gEBCN failure to find non-leading classes
      		return div.getElementsByClassName("i").length === 2;
      	});
      
      	// Support: IE<10
      	// Check if getElementById returns elements by name
      	// The broken getElementById methods don't pick up programatically-set names,
      	// so use a roundabout getElementsByName test
      	support.getById = assert(function( div ) {
      		docElem.appendChild( div ).id = expando;
      		return !doc.getElementsByName || !doc.getElementsByName( expando ).length;
      	});
      
      	// ID find and filter
      	if ( support.getById ) {
      		Expr.find["ID"] = function( id, context ) {
      			if ( typeof context.getElementById !== strundefined && documentIsHTML ) {
      				var m = context.getElementById( id );
      				// Check parentNode to catch when Blackberry 4.6 returns
      				// nodes that are no longer in the document #6963
      				return m && m.parentNode ? [m] : [];
      			}
      		};
      		Expr.filter["ID"] = function( id ) {
      			var attrId = id.replace( runescape, funescape );
      			return function( elem ) {
      				return elem.getAttribute("id") === attrId;
      			};
      		};
      	} else {
      		// Support: IE6/7
      		// getElementById is not reliable as a find shortcut
      		delete Expr.find["ID"];
      
      		Expr.filter["ID"] =  function( id ) {
      			var attrId = id.replace( runescape, funescape );
      			return function( elem ) {
      				var node = typeof elem.getAttributeNode !== strundefined && elem.getAttributeNode("id");
      				return node && node.value === attrId;
      			};
      		};
      	}
      
      	// Tag
      	Expr.find["TAG"] = support.getElementsByTagName ?
      		function( tag, context ) {
      			if ( typeof context.getElementsByTagName !== strundefined ) {
      				return context.getElementsByTagName( tag );
      			}
      		} :
      		function( tag, context ) {
      			var elem,
      				tmp = [],
      				i = 0,
      				results = context.getElementsByTagName( tag );
      
      			// Filter out possible comments
      			if ( tag === "*" ) {
      				while ( (elem = results[i++]) ) {
      					if ( elem.nodeType === 1 ) {
      						tmp.push( elem );
      					}
      				}
      
      				return tmp;
      			}
      			return results;
      		};
      
      	// Class
      	Expr.find["CLASS"] = support.getElementsByClassName && function( className, context ) {
      		if ( typeof context.getElementsByClassName !== strundefined && documentIsHTML ) {
      			return context.getElementsByClassName( className );
      		}
      	};
      
      	/* QSA/matchesSelector
      	---------------------------------------------------------------------- */
      
      	// QSA and matchesSelector support
      
      	// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
      	rbuggyMatches = [];
      
      	// qSa(:focus) reports false when true (Chrome 21)
      	// We allow this because of a bug in IE8/9 that throws an error
      	// whenever `document.activeElement` is accessed on an iframe
      	// So, we allow :focus to pass through QSA all the time to avoid the IE error
      	// See http://bugs.jquery.com/ticket/13378
      	rbuggyQSA = [];
      
      	if ( (support.qsa = rnative.test( doc.querySelectorAll )) ) {
      		// Build QSA regex
      		// Regex strategy adopted from Diego Perini
      		assert(function( div ) {
      			// Select is set to empty string on purpose
      			// This is to test IE's treatment of not explicitly
      			// setting a boolean content attribute,
      			// since its presence should be enough
      			// http://bugs.jquery.com/ticket/12359
      			div.innerHTML = "<select><option selected=''></option></select>";
      
      			// Support: IE8
      			// Boolean attributes and "value" are not treated correctly
      			if ( !div.querySelectorAll("[selected]").length ) {
      				rbuggyQSA.push( "\\[" + whitespace + "*(?:value|" + booleans + ")" );
      			}
      
      			// Webkit/Opera - :checked should return selected option elements
      			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
      			// IE8 throws error here and will not see later tests
      			if ( !div.querySelectorAll(":checked").length ) {
      				rbuggyQSA.push(":checked");
      			}
      		});
      
      		assert(function( div ) {
      
      			// Support: Opera 10-12/IE8
      			// ^= $= *= and empty values
      			// Should not select anything
      			// Support: Windows 8 Native Apps
      			// The type attribute is restricted during .innerHTML assignment
      			var input = doc.createElement("input");
      			input.setAttribute( "type", "hidden" );
      			div.appendChild( input ).setAttribute( "t", "" );
      
      			if ( div.querySelectorAll("[t^='']").length ) {
      				rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:''|\"\")" );
      			}
      
      			// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
      			// IE8 throws error here and will not see later tests
      			if ( !div.querySelectorAll(":enabled").length ) {
      				rbuggyQSA.push( ":enabled", ":disabled" );
      			}
      
      			// Opera 10-11 does not throw on post-comma invalid pseudos
      			div.querySelectorAll("*,:x");
      			rbuggyQSA.push(",.*:");
      		});
      	}
      
      	if ( (support.matchesSelector = rnative.test( (matches = docElem.webkitMatchesSelector ||
      		docElem.mozMatchesSelector ||
      		docElem.oMatchesSelector ||
      		docElem.msMatchesSelector) )) ) {
      
      		assert(function( div ) {
      			// Check to see if it's possible to do matchesSelector
      			// on a disconnected node (IE 9)
      			support.disconnectedMatch = matches.call( div, "div" );
      
      			// This should fail with an exception
      			// Gecko does not error, returns false instead
      			matches.call( div, "[s!='']:x" );
      			rbuggyMatches.push( "!=", pseudos );
      		});
      	}
      
      	rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join("|") );
      	rbuggyMatches = rbuggyMatches.length && new RegExp( rbuggyMatches.join("|") );
      
      	/* Contains
      	---------------------------------------------------------------------- */
      
      	// Element contains another
      	// Purposefully does not implement inclusive descendent
      	// As in, an element does not contain itself
      	contains = rnative.test( docElem.contains ) || docElem.compareDocumentPosition ?
      		function( a, b ) {
      			var adown = a.nodeType === 9 ? a.documentElement : a,
      				bup = b && b.parentNode;
      			return a === bup || !!( bup && bup.nodeType === 1 && (
      				adown.contains ?
      					adown.contains( bup ) :
      					a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
      			));
      		} :
      		function( a, b ) {
      			if ( b ) {
      				while ( (b = b.parentNode) ) {
      					if ( b === a ) {
      						return true;
      					}
      				}
      			}
      			return false;
      		};
      
      	/* Sorting
      	---------------------------------------------------------------------- */
      
      	// Document order sorting
      	sortOrder = docElem.compareDocumentPosition ?
      	function( a, b ) {
      
      		// Flag for duplicate removal
      		if ( a === b ) {
      			hasDuplicate = true;
      			return 0;
      		}
      
      		var compare = b.compareDocumentPosition && a.compareDocumentPosition && a.compareDocumentPosition( b );
      
      		if ( compare ) {
      			// Disconnected nodes
      			if ( compare & 1 ||
      				(!support.sortDetached && b.compareDocumentPosition( a ) === compare) ) {
      
      				// Choose the first element that is related to our preferred document
      				if ( a === doc || contains(preferredDoc, a) ) {
      					return -1;
      				}
      				if ( b === doc || contains(preferredDoc, b) ) {
      					return 1;
      				}
      
      				// Maintain original order
      				return sortInput ?
      					( indexOf.call( sortInput, a ) - indexOf.call( sortInput, b ) ) :
      					0;
      			}
      
      			return compare & 4 ? -1 : 1;
      		}
      
      		// Not directly comparable, sort on existence of method
      		return a.compareDocumentPosition ? -1 : 1;
      	} :
      	function( a, b ) {
      		var cur,
      			i = 0,
      			aup = a.parentNode,
      			bup = b.parentNode,
      			ap = [ a ],
      			bp = [ b ];
      
      		// Exit early if the nodes are identical
      		if ( a === b ) {
      			hasDuplicate = true;
      			return 0;
      
      		// Parentless nodes are either documents or disconnected
      		} else if ( !aup || !bup ) {
      			return a === doc ? -1 :
      				b === doc ? 1 :
      				aup ? -1 :
      				bup ? 1 :
      				sortInput ?
      				( indexOf.call( sortInput, a ) - indexOf.call( sortInput, b ) ) :
      				0;
      
      		// If the nodes are siblings, we can do a quick check
      		} else if ( aup === bup ) {
      			return siblingCheck( a, b );
      		}
      
      		// Otherwise we need full lists of their ancestors for comparison
      		cur = a;
      		while ( (cur = cur.parentNode) ) {
      			ap.unshift( cur );
      		}
      		cur = b;
      		while ( (cur = cur.parentNode) ) {
      			bp.unshift( cur );
      		}
      
      		// Walk down the tree looking for a discrepancy
      		while ( ap[i] === bp[i] ) {
      			i++;
      		}
      
      		return i ?
      			// Do a sibling check if the nodes have a common ancestor
      			siblingCheck( ap[i], bp[i] ) :
      
      			// Otherwise nodes in our document sort first
      			ap[i] === preferredDoc ? -1 :
      			bp[i] === preferredDoc ? 1 :
      			0;
      	};
      
      	return doc;
      };
      
      Sizzle.matches = function( expr, elements ) {
      	return Sizzle( expr, null, null, elements );
      };
      
      Sizzle.matchesSelector = function( elem, expr ) {
      	// Set document vars if needed
      	if ( ( elem.ownerDocument || elem ) !== document ) {
      		setDocument( elem );
      	}
      
      	// Make sure that attribute selectors are quoted
      	expr = expr.replace( rattributeQuotes, "='$1']" );
      
      	if ( support.matchesSelector && documentIsHTML &&
      		( !rbuggyMatches || !rbuggyMatches.test( expr ) ) &&
      		( !rbuggyQSA     || !rbuggyQSA.test( expr ) ) ) {
      
      		try {
      			var ret = matches.call( elem, expr );
      
      			// IE 9's matchesSelector returns false on disconnected nodes
      			if ( ret || support.disconnectedMatch ||
      					// As well, disconnected nodes are said to be in a document
      					// fragment in IE 9
      					elem.document && elem.document.nodeType !== 11 ) {
      				return ret;
      			}
      		} catch(e) {}
      	}
      
      	return Sizzle( expr, document, null, [elem] ).length > 0;
      };
      
      Sizzle.contains = function( context, elem ) {
      	// Set document vars if needed
      	if ( ( context.ownerDocument || context ) !== document ) {
      		setDocument( context );
      	}
      	return contains( context, elem );
      };
      
      Sizzle.attr = function( elem, name ) {
      	// Set document vars if needed
      	if ( ( elem.ownerDocument || elem ) !== document ) {
      		setDocument( elem );
      	}
      
      	var fn = Expr.attrHandle[ name.toLowerCase() ],
      		// Don't get fooled by Object.prototype properties (jQuery #13807)
      		val = fn && hasOwn.call( Expr.attrHandle, name.toLowerCase() ) ?
      			fn( elem, name, !documentIsHTML ) :
      			undefined;
      
      	return val === undefined ?
      		support.attributes || !documentIsHTML ?
      			elem.getAttribute( name ) :
      			(val = elem.getAttributeNode(name)) && val.specified ?
      				val.value :
      				null :
      		val;
      };
      
      Sizzle.error = function( msg ) {
      	throw new Error( "Syntax error, unrecognized expression: " + msg );
      };
      
      /**
       * Document sorting and removing duplicates
       * @param {ArrayLike} results
       */
      Sizzle.uniqueSort = function( results ) {
      	var elem,
      		duplicates = [],
      		j = 0,
      		i = 0;
      
      	// Unless we *know* we can detect duplicates, assume their presence
      	hasDuplicate = !support.detectDuplicates;
      	sortInput = !support.sortStable && results.slice( 0 );
      	results.sort( sortOrder );
      
      	if ( hasDuplicate ) {
      		while ( (elem = results[i++]) ) {
      			if ( elem === results[ i ] ) {
      				j = duplicates.push( i );
      			}
      		}
      		while ( j-- ) {
      			results.splice( duplicates[ j ], 1 );
      		}
      	}
      
      	return results;
      };
      
      /**
       * Utility function for retrieving the text value of an array of DOM nodes
       * @param {Array|Element} elem
       */
      getText = Sizzle.getText = function( elem ) {
      	var node,
      		ret = "",
      		i = 0,
      		nodeType = elem.nodeType;
      
      	if ( !nodeType ) {
      		// If no nodeType, this is expected to be an array
      		for ( ; (node = elem[i]); i++ ) {
      			// Do not traverse comment nodes
      			ret += getText( node );
      		}
      	} else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
      		// Use textContent for elements
      		// innerText usage removed for consistency of new lines (see #11153)
      		if ( typeof elem.textContent === "string" ) {
      			return elem.textContent;
      		} else {
      			// Traverse its children
      			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
      				ret += getText( elem );
      			}
      		}
      	} else if ( nodeType === 3 || nodeType === 4 ) {
      		return elem.nodeValue;
      	}
      	// Do not include comment or processing instruction nodes
      
      	return ret;
      };
      
      Expr = Sizzle.selectors = {
      
      	// Can be adjusted by the user
      	cacheLength: 50,
      
      	createPseudo: markFunction,
      
      	match: matchExpr,
      
      	attrHandle: {},
      
      	find: {},
      
      	relative: {
      		">": { dir: "parentNode", first: true },
      		" ": { dir: "parentNode" },
      		"+": { dir: "previousSibling", first: true },
      		"~": { dir: "previousSibling" }
      	},
      
      	preFilter: {
      		"ATTR": function( match ) {
      			match[1] = match[1].replace( runescape, funescape );
      
      			// Move the given value to match[3] whether quoted or unquoted
      			match[3] = ( match[4] || match[5] || "" ).replace( runescape, funescape );
      
      			if ( match[2] === "~=" ) {
      				match[3] = " " + match[3] + " ";
      			}
      
      			return match.slice( 0, 4 );
      		},
      
      		"CHILD": function( match ) {
      			/* matches from matchExpr["CHILD"]
      				1 type (only|nth|...)
      				2 what (child|of-type)
      				3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
      				4 xn-component of xn+y argument ([+-]?\d*n|)
      				5 sign of xn-component
      				6 x of xn-component
      				7 sign of y-component
      				8 y of y-component
      			*/
      			match[1] = match[1].toLowerCase();
      
      			if ( match[1].slice( 0, 3 ) === "nth" ) {
      				// nth-* requires argument
      				if ( !match[3] ) {
      					Sizzle.error( match[0] );
      				}
      
      				// numeric x and y parameters for Expr.filter.CHILD
      				// remember that false/true cast respectively to 0/1
      				match[4] = +( match[4] ? match[5] + (match[6] || 1) : 2 * ( match[3] === "even" || match[3] === "odd" ) );
      				match[5] = +( ( match[7] + match[8] ) || match[3] === "odd" );
      
      			// other types prohibit arguments
      			} else if ( match[3] ) {
      				Sizzle.error( match[0] );
      			}
      
      			return match;
      		},
      
      		"PSEUDO": function( match ) {
      			var excess,
      				unquoted = !match[5] && match[2];
      
      			if ( matchExpr["CHILD"].test( match[0] ) ) {
      				return null;
      			}
      
      			// Accept quoted arguments as-is
      			if ( match[3] && match[4] !== undefined ) {
      				match[2] = match[4];
      
      			// Strip excess characters from unquoted arguments
      			} else if ( unquoted && rpseudo.test( unquoted ) &&
      				// Get excess from tokenize (recursively)
      				(excess = tokenize( unquoted, true )) &&
      				// advance to the next closing parenthesis
      				(excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {
      
      				// excess is a negative index
      				match[0] = match[0].slice( 0, excess );
      				match[2] = unquoted.slice( 0, excess );
      			}
      
      			// Return only captures needed by the pseudo filter method (type and argument)
      			return match.slice( 0, 3 );
      		}
      	},
      
      	filter: {
      
      		"TAG": function( nodeNameSelector ) {
      			var nodeName = nodeNameSelector.replace( runescape, funescape ).toLowerCase();
      			return nodeNameSelector === "*" ?
      				function() { return true; } :
      				function( elem ) {
      					return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
      				};
      		},
      
      		"CLASS": function( className ) {
      			var pattern = classCache[ className + " " ];
      
      			return pattern ||
      				(pattern = new RegExp( "(^|" + whitespace + ")" + className + "(" + whitespace + "|$)" )) &&
      				classCache( className, function( elem ) {
      					return pattern.test( typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== strundefined && elem.getAttribute("class") || "" );
      				});
      		},
      
      		"ATTR": function( name, operator, check ) {
      			return function( elem ) {
      				var result = Sizzle.attr( elem, name );
      
      				if ( result == null ) {
      					return operator === "!=";
      				}
      				if ( !operator ) {
      					return true;
      				}
      
      				result += "";
      
      				return operator === "=" ? result === check :
      					operator === "!=" ? result !== check :
      					operator === "^=" ? check && result.indexOf( check ) === 0 :
      					operator === "*=" ? check && result.indexOf( check ) > -1 :
      					operator === "$=" ? check && result.slice( -check.length ) === check :
      					operator === "~=" ? ( " " + result + " " ).indexOf( check ) > -1 :
      					operator === "|=" ? result === check || result.slice( 0, check.length + 1 ) === check + "-" :
      					false;
      			};
      		},
      
      		"CHILD": function( type, what, argument, first, last ) {
      			var simple = type.slice( 0, 3 ) !== "nth",
      				forward = type.slice( -4 ) !== "last",
      				ofType = what === "of-type";
      
      			return first === 1 && last === 0 ?
      
      				// Shortcut for :nth-*(n)
      				function( elem ) {
      					return !!elem.parentNode;
      				} :
      
      				function( elem, context, xml ) {
      					var cache, outerCache, node, diff, nodeIndex, start,
      						dir = simple !== forward ? "nextSibling" : "previousSibling",
      						parent = elem.parentNode,
      						name = ofType && elem.nodeName.toLowerCase(),
      						useCache = !xml && !ofType;
      
      					if ( parent ) {
      
      						// :(first|last|only)-(child|of-type)
      						if ( simple ) {
      							while ( dir ) {
      								node = elem;
      								while ( (node = node[ dir ]) ) {
      									if ( ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1 ) {
      										return false;
      									}
      								}
      								// Reverse direction for :only-* (if we haven't yet done so)
      								start = dir = type === "only" && !start && "nextSibling";
      							}
      							return true;
      						}
      
      						start = [ forward ? parent.firstChild : parent.lastChild ];
      
      						// non-xml :nth-child(...) stores cache data on `parent`
      						if ( forward && useCache ) {
      							// Seek `elem` from a previously-cached index
      							outerCache = parent[ expando ] || (parent[ expando ] = {});
      							cache = outerCache[ type ] || [];
      							nodeIndex = cache[0] === dirruns && cache[1];
      							diff = cache[0] === dirruns && cache[2];
      							node = nodeIndex && parent.childNodes[ nodeIndex ];
      
      							while ( (node = ++nodeIndex && node && node[ dir ] ||
      
      								// Fallback to seeking `elem` from the start
      								(diff = nodeIndex = 0) || start.pop()) ) {
      
      								// When found, cache indexes on `parent` and break
      								if ( node.nodeType === 1 && ++diff && node === elem ) {
      									outerCache[ type ] = [ dirruns, nodeIndex, diff ];
      									break;
      								}
      							}
      
      						// Use previously-cached element index if available
      						} else if ( useCache && (cache = (elem[ expando ] || (elem[ expando ] = {}))[ type ]) && cache[0] === dirruns ) {
      							diff = cache[1];
      
      						// xml :nth-child(...) or :nth-last-child(...) or :nth(-last)?-of-type(...)
      						} else {
      							// Use the same loop as above to seek `elem` from the start
      							while ( (node = ++nodeIndex && node && node[ dir ] ||
      								(diff = nodeIndex = 0) || start.pop()) ) {
      
      								if ( ( ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1 ) && ++diff ) {
      									// Cache the index of each encountered element
      									if ( useCache ) {
      										(node[ expando ] || (node[ expando ] = {}))[ type ] = [ dirruns, diff ];
      									}
      
      									if ( node === elem ) {
      										break;
      									}
      								}
      							}
      						}
      
      						// Incorporate the offset, then check against cycle size
      						diff -= last;
      						return diff === first || ( diff % first === 0 && diff / first >= 0 );
      					}
      				};
      		},
      
      		"PSEUDO": function( pseudo, argument ) {
      			// pseudo-class names are case-insensitive
      			// http://www.w3.org/TR/selectors/#pseudo-classes
      			// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
      			// Remember that setFilters inherits from pseudos
      			var args,
      				fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
      					Sizzle.error( "unsupported pseudo: " + pseudo );
      
      			// The user may use createPseudo to indicate that
      			// arguments are needed to create the filter function
      			// just as Sizzle does
      			if ( fn[ expando ] ) {
      				return fn( argument );
      			}
      
      			// But maintain support for old signatures
      			if ( fn.length > 1 ) {
      				args = [ pseudo, pseudo, "", argument ];
      				return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
      					markFunction(function( seed, matches ) {
      						var idx,
      							matched = fn( seed, argument ),
      							i = matched.length;
      						while ( i-- ) {
      							idx = indexOf.call( seed, matched[i] );
      							seed[ idx ] = !( matches[ idx ] = matched[i] );
      						}
      					}) :
      					function( elem ) {
      						return fn( elem, 0, args );
      					};
      			}
      
      			return fn;
      		}
      	},
      
      	pseudos: {
      		// Potentially complex pseudos
      		"not": markFunction(function( selector ) {
      			// Trim the selector passed to compile
      			// to avoid treating leading and trailing
      			// spaces as combinators
      			var input = [],
      				results = [],
      				matcher = compile( selector.replace( rtrim, "$1" ) );
      
      			return matcher[ expando ] ?
      				markFunction(function( seed, matches, context, xml ) {
      					var elem,
      						unmatched = matcher( seed, null, xml, [] ),
      						i = seed.length;
      
      					// Match elements unmatched by `matcher`
      					while ( i-- ) {
      						if ( (elem = unmatched[i]) ) {
      							seed[i] = !(matches[i] = elem);
      						}
      					}
      				}) :
      				function( elem, context, xml ) {
      					input[0] = elem;
      					matcher( input, null, xml, results );
      					return !results.pop();
      				};
      		}),
      
      		"has": markFunction(function( selector ) {
      			return function( elem ) {
      				return Sizzle( selector, elem ).length > 0;
      			};
      		}),
      
      		"contains": markFunction(function( text ) {
      			return function( elem ) {
      				return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( text ) > -1;
      			};
      		}),
      
      		// "Whether an element is represented by a :lang() selector
      		// is based solely on the element's language value
      		// being equal to the identifier C,
      		// or beginning with the identifier C immediately followed by "-".
      		// The matching of C against the element's language value is performed case-insensitively.
      		// The identifier C does not have to be a valid language name."
      		// http://www.w3.org/TR/selectors/#lang-pseudo
      		"lang": markFunction( function( lang ) {
      			// lang value must be a valid identifier
      			if ( !ridentifier.test(lang || "") ) {
      				Sizzle.error( "unsupported lang: " + lang );
      			}
      			lang = lang.replace( runescape, funescape ).toLowerCase();
      			return function( elem ) {
      				var elemLang;
      				do {
      					if ( (elemLang = documentIsHTML ?
      						elem.lang :
      						elem.getAttribute("xml:lang") || elem.getAttribute("lang")) ) {
      
      						elemLang = elemLang.toLowerCase();
      						return elemLang === lang || elemLang.indexOf( lang + "-" ) === 0;
      					}
      				} while ( (elem = elem.parentNode) && elem.nodeType === 1 );
      				return false;
      			};
      		}),
      
      		// Miscellaneous
      		"target": function( elem ) {
      			var hash = window.location && window.location.hash;
      			return hash && hash.slice( 1 ) === elem.id;
      		},
      
      		"root": function( elem ) {
      			return elem === docElem;
      		},
      
      		"focus": function( elem ) {
      			return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
      		},
      
      		// Boolean properties
      		"enabled": function( elem ) {
      			return elem.disabled === false;
      		},
      
      		"disabled": function( elem ) {
      			return elem.disabled === true;
      		},
      
      		"checked": function( elem ) {
      			// In CSS3, :checked should return both checked and selected elements
      			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
      			var nodeName = elem.nodeName.toLowerCase();
      			return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
      		},
      
      		"selected": function( elem ) {
      			// Accessing this property makes selected-by-default
      			// options in Safari work properly
      			if ( elem.parentNode ) {
      				elem.parentNode.selectedIndex;
      			}
      
      			return elem.selected === true;
      		},
      
      		// Contents
      		"empty": function( elem ) {
      			// http://www.w3.org/TR/selectors/#empty-pseudo
      			// :empty is only affected by element nodes and content nodes(including text(3), cdata(4)),
      			//   not comment, processing instructions, or others
      			// Thanks to Diego Perini for the nodeName shortcut
      			//   Greater than "@" means alpha characters (specifically not starting with "#" or "?")
      			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
      				if ( elem.nodeName > "@" || elem.nodeType === 3 || elem.nodeType === 4 ) {
      					return false;
      				}
      			}
      			return true;
      		},
      
      		"parent": function( elem ) {
      			return !Expr.pseudos["empty"]( elem );
      		},
      
      		// Element/input types
      		"header": function( elem ) {
      			return rheader.test( elem.nodeName );
      		},
      
      		"input": function( elem ) {
      			return rinputs.test( elem.nodeName );
      		},
      
      		"button": function( elem ) {
      			var name = elem.nodeName.toLowerCase();
      			return name === "input" && elem.type === "button" || name === "button";
      		},
      
      		"text": function( elem ) {
      			var attr;
      			// IE6 and 7 will map elem.type to 'text' for new HTML5 types (search, etc)
      			// use getAttribute instead to test this case
      			return elem.nodeName.toLowerCase() === "input" &&
      				elem.type === "text" &&
      				( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === elem.type );
      		},
      
      		// Position-in-collection
      		"first": createPositionalPseudo(function() {
      			return [ 0 ];
      		}),
      
      		"last": createPositionalPseudo(function( matchIndexes, length ) {
      			return [ length - 1 ];
      		}),
      
      		"eq": createPositionalPseudo(function( matchIndexes, length, argument ) {
      			return [ argument < 0 ? argument + length : argument ];
      		}),
      
      		"even": createPositionalPseudo(function( matchIndexes, length ) {
      			var i = 0;
      			for ( ; i < length; i += 2 ) {
      				matchIndexes.push( i );
      			}
      			return matchIndexes;
      		}),
      
      		"odd": createPositionalPseudo(function( matchIndexes, length ) {
      			var i = 1;
      			for ( ; i < length; i += 2 ) {
      				matchIndexes.push( i );
      			}
      			return matchIndexes;
      		}),
      
      		"lt": createPositionalPseudo(function( matchIndexes, length, argument ) {
      			var i = argument < 0 ? argument + length : argument;
      			for ( ; --i >= 0; ) {
      				matchIndexes.push( i );
      			}
      			return matchIndexes;
      		}),
      
      		"gt": createPositionalPseudo(function( matchIndexes, length, argument ) {
      			var i = argument < 0 ? argument + length : argument;
      			for ( ; ++i < length; ) {
      				matchIndexes.push( i );
      			}
      			return matchIndexes;
      		})
      	}
      };
      
      Expr.pseudos["nth"] = Expr.pseudos["eq"];
      
      // Add button/input type pseudos
      for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {
      	Expr.pseudos[ i ] = createInputPseudo( i );
      }
      for ( i in { submit: true, reset: true } ) {
      	Expr.pseudos[ i ] = createButtonPseudo( i );
      }
      
      // Easy API for creating new setFilters
      function setFilters() {}
      setFilters.prototype = Expr.filters = Expr.pseudos;
      Expr.setFilters = new setFilters();
      
      function tokenize( selector, parseOnly ) {
      	var matched, match, tokens, type,
      		soFar, groups, preFilters,
      		cached = tokenCache[ selector + " " ];
      
      	if ( cached ) {
      		return parseOnly ? 0 : cached.slice( 0 );
      	}
      
      	soFar = selector;
      	groups = [];
      	preFilters = Expr.preFilter;
      
      	while ( soFar ) {
      
      		// Comma and first run
      		if ( !matched || (match = rcomma.exec( soFar )) ) {
      			if ( match ) {
      				// Don't consume trailing commas as valid
      				soFar = soFar.slice( match[0].length ) || soFar;
      			}
      			groups.push( tokens = [] );
      		}
      
      		matched = false;
      
      		// Combinators
      		if ( (match = rcombinators.exec( soFar )) ) {
      			matched = match.shift();
      			tokens.push({
      				value: matched,
      				// Cast descendant combinators to space
      				type: match[0].replace( rtrim, " " )
      			});
      			soFar = soFar.slice( matched.length );
      		}
      
      		// Filters
      		for ( type in Expr.filter ) {
      			if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
      				(match = preFilters[ type ]( match ))) ) {
      				matched = match.shift();
      				tokens.push({
      					value: matched,
      					type: type,
      					matches: match
      				});
      				soFar = soFar.slice( matched.length );
      			}
      		}
      
      		if ( !matched ) {
      			break;
      		}
      	}
      
      	// Return the length of the invalid excess
      	// if we're just parsing
      	// Otherwise, throw an error or return tokens
      	return parseOnly ?
      		soFar.length :
      		soFar ?
      			Sizzle.error( selector ) :
      			// Cache the tokens
      			tokenCache( selector, groups ).slice( 0 );
      }
      
      function toSelector( tokens ) {
      	var i = 0,
      		len = tokens.length,
      		selector = "";
      	for ( ; i < len; i++ ) {
      		selector += tokens[i].value;
      	}
      	return selector;
      }
      
      function addCombinator( matcher, combinator, base ) {
      	var dir = combinator.dir,
      		checkNonElements = base && dir === "parentNode",
      		doneName = done++;
      
      	return combinator.first ?
      		// Check against closest ancestor/preceding element
      		function( elem, context, xml ) {
      			while ( (elem = elem[ dir ]) ) {
      				if ( elem.nodeType === 1 || checkNonElements ) {
      					return matcher( elem, context, xml );
      				}
      			}
      		} :
      
      		// Check against all ancestor/preceding elements
      		function( elem, context, xml ) {
      			var data, cache, outerCache,
      				dirkey = dirruns + " " + doneName;
      
      			// We can't set arbitrary data on XML nodes, so they don't benefit from dir caching
      			if ( xml ) {
      				while ( (elem = elem[ dir ]) ) {
      					if ( elem.nodeType === 1 || checkNonElements ) {
      						if ( matcher( elem, context, xml ) ) {
      							return true;
      						}
      					}
      				}
      			} else {
      				while ( (elem = elem[ dir ]) ) {
      					if ( elem.nodeType === 1 || checkNonElements ) {
      						outerCache = elem[ expando ] || (elem[ expando ] = {});
      						if ( (cache = outerCache[ dir ]) && cache[0] === dirkey ) {
      							if ( (data = cache[1]) === true || data === cachedruns ) {
      								return data === true;
      							}
      						} else {
      							cache = outerCache[ dir ] = [ dirkey ];
      							cache[1] = matcher( elem, context, xml ) || cachedruns;
      							if ( cache[1] === true ) {
      								return true;
      							}
      						}
      					}
      				}
      			}
      		};
      }
      
      function elementMatcher( matchers ) {
      	return matchers.length > 1 ?
      		function( elem, context, xml ) {
      			var i = matchers.length;
      			while ( i-- ) {
      				if ( !matchers[i]( elem, context, xml ) ) {
      					return false;
      				}
      			}
      			return true;
      		} :
      		matchers[0];
      }
      
      function condense( unmatched, map, filter, context, xml ) {
      	var elem,
      		newUnmatched = [],
      		i = 0,
      		len = unmatched.length,
      		mapped = map != null;
      
      	for ( ; i < len; i++ ) {
      		if ( (elem = unmatched[i]) ) {
      			if ( !filter || filter( elem, context, xml ) ) {
      				newUnmatched.push( elem );
      				if ( mapped ) {
      					map.push( i );
      				}
      			}
      		}
      	}
      
      	return newUnmatched;
      }
      
      function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
      	if ( postFilter && !postFilter[ expando ] ) {
      		postFilter = setMatcher( postFilter );
      	}
      	if ( postFinder && !postFinder[ expando ] ) {
      		postFinder = setMatcher( postFinder, postSelector );
      	}
      	return markFunction(function( seed, results, context, xml ) {
      		var temp, i, elem,
      			preMap = [],
      			postMap = [],
      			preexisting = results.length,
      
      			// Get initial elements from seed or context
      			elems = seed || multipleContexts( selector || "*", context.nodeType ? [ context ] : context, [] ),
      
      			// Prefilter to get matcher input, preserving a map for seed-results synchronization
      			matcherIn = preFilter && ( seed || !selector ) ?
      				condense( elems, preMap, preFilter, context, xml ) :
      				elems,
      
      			matcherOut = matcher ?
      				// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
      				postFinder || ( seed ? preFilter : preexisting || postFilter ) ?
      
      					// ...intermediate processing is necessary
      					[] :
      
      					// ...otherwise use results directly
      					results :
      				matcherIn;
      
      		// Find primary matches
      		if ( matcher ) {
      			matcher( matcherIn, matcherOut, context, xml );
      		}
      
      		// Apply postFilter
      		if ( postFilter ) {
      			temp = condense( matcherOut, postMap );
      			postFilter( temp, [], context, xml );
      
      			// Un-match failing elements by moving them back to matcherIn
      			i = temp.length;
      			while ( i-- ) {
      				if ( (elem = temp[i]) ) {
      					matcherOut[ postMap[i] ] = !(matcherIn[ postMap[i] ] = elem);
      				}
      			}
      		}
      
      		if ( seed ) {
      			if ( postFinder || preFilter ) {
      				if ( postFinder ) {
      					// Get the final matcherOut by condensing this intermediate into postFinder contexts
      					temp = [];
      					i = matcherOut.length;
      					while ( i-- ) {
      						if ( (elem = matcherOut[i]) ) {
      							// Restore matcherIn since elem is not yet a final match
      							temp.push( (matcherIn[i] = elem) );
      						}
      					}
      					postFinder( null, (matcherOut = []), temp, xml );
      				}
      
      				// Move matched elements from seed to results to keep them synchronized
      				i = matcherOut.length;
      				while ( i-- ) {
      					if ( (elem = matcherOut[i]) &&
      						(temp = postFinder ? indexOf.call( seed, elem ) : preMap[i]) > -1 ) {
      
      						seed[temp] = !(results[temp] = elem);
      					}
      				}
      			}
      
      		// Add elements to results, through postFinder if defined
      		} else {
      			matcherOut = condense(
      				matcherOut === results ?
      					matcherOut.splice( preexisting, matcherOut.length ) :
      					matcherOut
      			);
      			if ( postFinder ) {
      				postFinder( null, results, matcherOut, xml );
      			} else {
      				push.apply( results, matcherOut );
      			}
      		}
      	});
      }
      
      function matcherFromTokens( tokens ) {
      	var checkContext, matcher, j,
      		len = tokens.length,
      		leadingRelative = Expr.relative[ tokens[0].type ],
      		implicitRelative = leadingRelative || Expr.relative[" "],
      		i = leadingRelative ? 1 : 0,
      
      		// The foundational matcher ensures that elements are reachable from top-level context(s)
      		matchContext = addCombinator( function( elem ) {
      			return elem === checkContext;
      		}, implicitRelative, true ),
      		matchAnyContext = addCombinator( function( elem ) {
      			return indexOf.call( checkContext, elem ) > -1;
      		}, implicitRelative, true ),
      		matchers = [ function( elem, context, xml ) {
      			return ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
      				(checkContext = context).nodeType ?
      					matchContext( elem, context, xml ) :
      					matchAnyContext( elem, context, xml ) );
      		} ];
      
      	for ( ; i < len; i++ ) {
      		if ( (matcher = Expr.relative[ tokens[i].type ]) ) {
      			matchers = [ addCombinator(elementMatcher( matchers ), matcher) ];
      		} else {
      			matcher = Expr.filter[ tokens[i].type ].apply( null, tokens[i].matches );
      
      			// Return special upon seeing a positional matcher
      			if ( matcher[ expando ] ) {
      				// Find the next relative operator (if any) for proper handling
      				j = ++i;
      				for ( ; j < len; j++ ) {
      					if ( Expr.relative[ tokens[j].type ] ) {
      						break;
      					}
      				}
      				return setMatcher(
      					i > 1 && elementMatcher( matchers ),
      					i > 1 && toSelector(
      						// If the preceding token was a descendant combinator, insert an implicit any-element `*`
      						tokens.slice( 0, i - 1 ).concat({ value: tokens[ i - 2 ].type === " " ? "*" : "" })
      					).replace( rtrim, "$1" ),
      					matcher,
      					i < j && matcherFromTokens( tokens.slice( i, j ) ),
      					j < len && matcherFromTokens( (tokens = tokens.slice( j )) ),
      					j < len && toSelector( tokens )
      				);
      			}
      			matchers.push( matcher );
      		}
      	}
      
      	return elementMatcher( matchers );
      }
      
      function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
      	// A counter to specify which element is currently being matched
      	var matcherCachedRuns = 0,
      		bySet = setMatchers.length > 0,
      		byElement = elementMatchers.length > 0,
      		superMatcher = function( seed, context, xml, results, expandContext ) {
      			var elem, j, matcher,
      				setMatched = [],
      				matchedCount = 0,
      				i = "0",
      				unmatched = seed && [],
      				outermost = expandContext != null,
      				contextBackup = outermostContext,
      				// We must always have either seed elements or context
      				elems = seed || byElement && Expr.find["TAG"]( "*", expandContext && context.parentNode || context ),
      				// Use integer dirruns iff this is the outermost matcher
      				dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1);
      
      			if ( outermost ) {
      				outermostContext = context !== document && context;
      				cachedruns = matcherCachedRuns;
      			}
      
      			// Add elements passing elementMatchers directly to results
      			// Keep `i` a string if there are no elements so `matchedCount` will be "00" below
      			for ( ; (elem = elems[i]) != null; i++ ) {
      				if ( byElement && elem ) {
      					j = 0;
      					while ( (matcher = elementMatchers[j++]) ) {
      						if ( matcher( elem, context, xml ) ) {
      							results.push( elem );
      							break;
      						}
      					}
      					if ( outermost ) {
      						dirruns = dirrunsUnique;
      						cachedruns = ++matcherCachedRuns;
      					}
      				}
      
      				// Track unmatched elements for set filters
      				if ( bySet ) {
      					// They will have gone through all possible matchers
      					if ( (elem = !matcher && elem) ) {
      						matchedCount--;
      					}
      
      					// Lengthen the array for every element, matched or not
      					if ( seed ) {
      						unmatched.push( elem );
      					}
      				}
      			}
      
      			// Apply set filters to unmatched elements
      			matchedCount += i;
      			if ( bySet && i !== matchedCount ) {
      				j = 0;
      				while ( (matcher = setMatchers[j++]) ) {
      					matcher( unmatched, setMatched, context, xml );
      				}
      
      				if ( seed ) {
      					// Reintegrate element matches to eliminate the need for sorting
      					if ( matchedCount > 0 ) {
      						while ( i-- ) {
      							if ( !(unmatched[i] || setMatched[i]) ) {
      								setMatched[i] = pop.call( results );
      							}
      						}
      					}
      
      					// Discard index placeholder values to get only actual matches
      					setMatched = condense( setMatched );
      				}
      
      				// Add matches to results
      				push.apply( results, setMatched );
      
      				// Seedless set matches succeeding multiple successful matchers stipulate sorting
      				if ( outermost && !seed && setMatched.length > 0 &&
      					( matchedCount + setMatchers.length ) > 1 ) {
      
      					Sizzle.uniqueSort( results );
      				}
      			}
      
      			// Override manipulation of globals by nested matchers
      			if ( outermost ) {
      				dirruns = dirrunsUnique;
      				outermostContext = contextBackup;
      			}
      
      			return unmatched;
      		};
      
      	return bySet ?
      		markFunction( superMatcher ) :
      		superMatcher;
      }
      
      compile = Sizzle.compile = function( selector, group /* Internal Use Only */ ) {
      	var i,
      		setMatchers = [],
      		elementMatchers = [],
      		cached = compilerCache[ selector + " " ];
      
      	if ( !cached ) {
      		// Generate a function of recursive functions that can be used to check each element
      		if ( !group ) {
      			group = tokenize( selector );
      		}
      		i = group.length;
      		while ( i-- ) {
      			cached = matcherFromTokens( group[i] );
      			if ( cached[ expando ] ) {
      				setMatchers.push( cached );
      			} else {
      				elementMatchers.push( cached );
      			}
      		}
      
      		// Cache the compiled function
      		cached = compilerCache( selector, matcherFromGroupMatchers( elementMatchers, setMatchers ) );
      	}
      	return cached;
      };
      
      function multipleContexts( selector, contexts, results ) {
      	var i = 0,
      		len = contexts.length;
      	for ( ; i < len; i++ ) {
      		Sizzle( selector, contexts[i], results );
      	}
      	return results;
      }
      
      function select( selector, context, results, seed ) {
      	var i, tokens, token, type, find,
      		match = tokenize( selector );
      
      	if ( !seed ) {
      		// Try to minimize operations if there is only one group
      		if ( match.length === 1 ) {
      
      			// Take a shortcut and set the context if the root selector is an ID
      			tokens = match[0] = match[0].slice( 0 );
      			if ( tokens.length > 2 && (token = tokens[0]).type === "ID" &&
      					support.getById && context.nodeType === 9 && documentIsHTML &&
      					Expr.relative[ tokens[1].type ] ) {
      
      				context = ( Expr.find["ID"]( token.matches[0].replace(runescape, funescape), context ) || [] )[0];
      				if ( !context ) {
      					return results;
      				}
      				selector = selector.slice( tokens.shift().value.length );
      			}
      
      			// Fetch a seed set for right-to-left matching
      			i = matchExpr["needsContext"].test( selector ) ? 0 : tokens.length;
      			while ( i-- ) {
      				token = tokens[i];
      
      				// Abort if we hit a combinator
      				if ( Expr.relative[ (type = token.type) ] ) {
      					break;
      				}
      				if ( (find = Expr.find[ type ]) ) {
      					// Search, expanding context for leading sibling combinators
      					if ( (seed = find(
      						token.matches[0].replace( runescape, funescape ),
      						rsibling.test( tokens[0].type ) && context.parentNode || context
      					)) ) {
      
      						// If seed is empty or no tokens remain, we can return early
      						tokens.splice( i, 1 );
      						selector = seed.length && toSelector( tokens );
      						if ( !selector ) {
      							push.apply( results, seed );
      							return results;
      						}
      
      						break;
      					}
      				}
      			}
      		}
      	}
      
      	// Compile and execute a filtering function
      	// Provide `match` to avoid retokenization if we modified the selector above
      	compile( selector, match )(
      		seed,
      		context,
      		!documentIsHTML,
      		results,
      		rsibling.test( selector )
      	);
      	return results;
      }
      
      // One-time assignments
      
      // Sort stability
      support.sortStable = expando.split("").sort( sortOrder ).join("") === expando;
      
      // Support: Chrome<14
      // Always assume duplicates if they aren't passed to the comparison function
      support.detectDuplicates = hasDuplicate;
      
      // Initialize against the default document
      setDocument();
      
      // Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
      // Detached nodes confoundingly follow *each other*
      support.sortDetached = assert(function( div1 ) {
      	// Should return 1, but returns 4 (following)
      	return div1.compareDocumentPosition( document.createElement("div") ) & 1;
      });
      
      // Support: IE<8
      // Prevent attribute/property "interpolation"
      // http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
      if ( !assert(function( div ) {
      	div.innerHTML = "<a href='#'></a>";
      	return div.firstChild.getAttribute("href") === "#" ;
      }) ) {
      	addHandle( "type|href|height|width", function( elem, name, isXML ) {
      		if ( !isXML ) {
      			return elem.getAttribute( name, name.toLowerCase() === "type" ? 1 : 2 );
      		}
      	});
      }
      
      // Support: IE<9
      // Use defaultValue in place of getAttribute("value")
      if ( !support.attributes || !assert(function( div ) {
      	div.innerHTML = "<input/>";
      	div.firstChild.setAttribute( "value", "" );
      	return div.firstChild.getAttribute( "value" ) === "";
      }) ) {
      	addHandle( "value", function( elem, name, isXML ) {
      		if ( !isXML && elem.nodeName.toLowerCase() === "input" ) {
      			return elem.defaultValue;
      		}
      	});
      }
      
      // Support: IE<9
      // Use getAttributeNode to fetch booleans when getAttribute lies
      if ( !assert(function( div ) {
      	return div.getAttribute("disabled") == null;
      }) ) {
      	addHandle( booleans, function( elem, name, isXML ) {
      		var val;
      		if ( !isXML ) {
      			return (val = elem.getAttributeNode( name )) && val.specified ?
      				val.value :
      				elem[ name ] === true ? name.toLowerCase() : null;
      		}
      	});
      }
      
      jQuery.find = Sizzle;
      jQuery.expr = Sizzle.selectors;
      jQuery.expr[":"] = jQuery.expr.pseudos;
      jQuery.unique = Sizzle.uniqueSort;
      jQuery.text = Sizzle.getText;
      jQuery.isXMLDoc = Sizzle.isXML;
      jQuery.contains = Sizzle.contains;
      
      
      })( window );
      // String to Object options format cache
      var optionsCache = {};
      
      // Convert String-formatted options into Object-formatted ones and store in cache
      function createOptions( options ) {
      	var object = optionsCache[ options ] = {};
      	jQuery.each( options.match( core_rnotwhite ) || [], function( _, flag ) {
      		object[ flag ] = true;
      	});
      	return object;
      }
      
      /*
       * Create a callback list using the following parameters:
       *
       *	options: an optional list of space-separated options that will change how
       *			the callback list behaves or a more traditional option object
       *
       * By default a callback list will act like an event callback list and can be
       * "fired" multiple times.
       *
       * Possible options:
       *
       *	once:			will ensure the callback list can only be fired once (like a Deferred)
       *
       *	memory:			will keep track of previous values and will call any callback added
       *					after the list has been fired right away with the latest "memorized"
       *					values (like a Deferred)
       *
       *	unique:			will ensure a callback can only be added once (no duplicate in the list)
       *
       *	stopOnFalse:	interrupt callings when a callback returns false
       *
       */
      jQuery.Callbacks = function( options ) {
      
      	// Convert options from String-formatted to Object-formatted if needed
      	// (we check in cache first)
      	options = typeof options === "string" ?
      		( optionsCache[ options ] || createOptions( options ) ) :
      		jQuery.extend( {}, options );
      
      	var // Last fire value (for non-forgettable lists)
      		memory,
      		// Flag to know if list was already fired
      		fired,
      		// Flag to know if list is currently firing
      		firing,
      		// First callback to fire (used internally by add and fireWith)
      		firingStart,
      		// End of the loop when firing
      		firingLength,
      		// Index of currently firing callback (modified by remove if needed)
      		firingIndex,
      		// Actual callback list
      		list = [],
      		// Stack of fire calls for repeatable lists
      		stack = !options.once && [],
      		// Fire callbacks
      		fire = function( data ) {
      			memory = options.memory && data;
      			fired = true;
      			firingIndex = firingStart || 0;
      			firingStart = 0;
      			firingLength = list.length;
      			firing = true;
      			for ( ; list && firingIndex < firingLength; firingIndex++ ) {
      				if ( list[ firingIndex ].apply( data[ 0 ], data[ 1 ] ) === false && options.stopOnFalse ) {
      					memory = false; // To prevent further calls using add
      					break;
      				}
      			}
      			firing = false;
      			if ( list ) {
      				if ( stack ) {
      					if ( stack.length ) {
      						fire( stack.shift() );
      					}
      				} else if ( memory ) {
      					list = [];
      				} else {
      					self.disable();
      				}
      			}
      		},
      		// Actual Callbacks object
      		self = {
      			// Add a callback or a collection of callbacks to the list
      			add: function() {
      				if ( list ) {
      					// First, we save the current length
      					var start = list.length;
      					(function add( args ) {
      						jQuery.each( args, function( _, arg ) {
      							var type = jQuery.type( arg );
      							if ( type === "function" ) {
      								if ( !options.unique || !self.has( arg ) ) {
      									list.push( arg );
      								}
      							} else if ( arg && arg.length && type !== "string" ) {
      								// Inspect recursively
      								add( arg );
      							}
      						});
      					})( arguments );
      					// Do we need to add the callbacks to the
      					// current firing batch?
      					if ( firing ) {
      						firingLength = list.length;
      					// With memory, if we're not firing then
      					// we should call right away
      					} else if ( memory ) {
      						firingStart = start;
      						fire( memory );
      					}
      				}
      				return this;
      			},
      			// Remove a callback from the list
      			remove: function() {
      				if ( list ) {
      					jQuery.each( arguments, function( _, arg ) {
      						var index;
      						while( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
      							list.splice( index, 1 );
      							// Handle firing indexes
      							if ( firing ) {
      								if ( index <= firingLength ) {
      									firingLength--;
      								}
      								if ( index <= firingIndex ) {
      									firingIndex--;
      								}
      							}
      						}
      					});
      				}
      				return this;
      			},
      			// Check if a given callback is in the list.
      			// If no argument is given, return whether or not list has callbacks attached.
      			has: function( fn ) {
      				return fn ? jQuery.inArray( fn, list ) > -1 : !!( list && list.length );
      			},
      			// Remove all callbacks from the list
      			empty: function() {
      				list = [];
      				firingLength = 0;
      				return this;
      			},
      			// Have the list do nothing anymore
      			disable: function() {
      				list = stack = memory = undefined;
      				return this;
      			},
      			// Is it disabled?
      			disabled: function() {
      				return !list;
      			},
      			// Lock the list in its current state
      			lock: function() {
      				stack = undefined;
      				if ( !memory ) {
      					self.disable();
      				}
      				return this;
      			},
      			// Is it locked?
      			locked: function() {
      				return !stack;
      			},
      			// Call all callbacks with the given context and arguments
      			fireWith: function( context, args ) {
      				if ( list && ( !fired || stack ) ) {
      					args = args || [];
      					args = [ context, args.slice ? args.slice() : args ];
      					if ( firing ) {
      						stack.push( args );
      					} else {
      						fire( args );
      					}
      				}
      				return this;
      			},
      			// Call all the callbacks with the given arguments
      			fire: function() {
      				self.fireWith( this, arguments );
      				return this;
      			},
      			// To know if the callbacks have already been called at least once
      			fired: function() {
      				return !!fired;
      			}
      		};
      
      	return self;
      };
      jQuery.extend({
      
      	Deferred: function( func ) {
      		var tuples = [
      				// action, add listener, listener list, final state
      				[ "resolve", "done", jQuery.Callbacks("once memory"), "resolved" ],
      				[ "reject", "fail", jQuery.Callbacks("once memory"), "rejected" ],
      				[ "notify", "progress", jQuery.Callbacks("memory") ]
      			],
      			state = "pending",
      			promise = {
      				state: function() {
      					return state;
      				},
      				always: function() {
      					deferred.done( arguments ).fail( arguments );
      					return this;
      				},
      				then: function( /* fnDone, fnFail, fnProgress */ ) {
      					var fns = arguments;
      					return jQuery.Deferred(function( newDefer ) {
      						jQuery.each( tuples, function( i, tuple ) {
      							var action = tuple[ 0 ],
      								fn = jQuery.isFunction( fns[ i ] ) && fns[ i ];
      							// deferred[ done | fail | progress ] for forwarding actions to newDefer
      							deferred[ tuple[1] ](function() {
      								var returned = fn && fn.apply( this, arguments );
      								if ( returned && jQuery.isFunction( returned.promise ) ) {
      									returned.promise()
      										.done( newDefer.resolve )
      										.fail( newDefer.reject )
      										.progress( newDefer.notify );
      								} else {
      									newDefer[ action + "With" ]( this === promise ? newDefer.promise() : this, fn ? [ returned ] : arguments );
      								}
      							});
      						});
      						fns = null;
      					}).promise();
      				},
      				// Get a promise for this deferred
      				// If obj is provided, the promise aspect is added to the object
      				promise: function( obj ) {
      					return obj != null ? jQuery.extend( obj, promise ) : promise;
      				}
      			},
      			deferred = {};
      
      		// Keep pipe for back-compat
      		promise.pipe = promise.then;
      
      		// Add list-specific methods
      		jQuery.each( tuples, function( i, tuple ) {
      			var list = tuple[ 2 ],
      				stateString = tuple[ 3 ];
      
      			// promise[ done | fail | progress ] = list.add
      			promise[ tuple[1] ] = list.add;
      
      			// Handle state
      			if ( stateString ) {
      				list.add(function() {
      					// state = [ resolved | rejected ]
      					state = stateString;
      
      				// [ reject_list | resolve_list ].disable; progress_list.lock
      				}, tuples[ i ^ 1 ][ 2 ].disable, tuples[ 2 ][ 2 ].lock );
      			}
      
      			// deferred[ resolve | reject | notify ]
      			deferred[ tuple[0] ] = function() {
      				deferred[ tuple[0] + "With" ]( this === deferred ? promise : this, arguments );
      				return this;
      			};
      			deferred[ tuple[0] + "With" ] = list.fireWith;
      		});
      
      		// Make the deferred a promise
      		promise.promise( deferred );
      
      		// Call given func if any
      		if ( func ) {
      			func.call( deferred, deferred );
      		}
      
      		// All done!
      		return deferred;
      	},
      
      	// Deferred helper
      	when: function( subordinate /* , ..., subordinateN */ ) {
      		var i = 0,
      			resolveValues = core_slice.call( arguments ),
      			length = resolveValues.length,
      
      			// the count of uncompleted subordinates
      			remaining = length !== 1 || ( subordinate && jQuery.isFunction( subordinate.promise ) ) ? length : 0,
      
      			// the master Deferred. If resolveValues consist of only a single Deferred, just use that.
      			deferred = remaining === 1 ? subordinate : jQuery.Deferred(),
      
      			// Update function for both resolve and progress values
      			updateFunc = function( i, contexts, values ) {
      				return function( value ) {
      					contexts[ i ] = this;
      					values[ i ] = arguments.length > 1 ? core_slice.call( arguments ) : value;
      					if( values === progressValues ) {
      						deferred.notifyWith( contexts, values );
      					} else if ( !( --remaining ) ) {
      						deferred.resolveWith( contexts, values );
      					}
      				};
      			},
      
      			progressValues, progressContexts, resolveContexts;
      
      		// add listeners to Deferred subordinates; treat others as resolved
      		if ( length > 1 ) {
      			progressValues = new Array( length );
      			progressContexts = new Array( length );
      			resolveContexts = new Array( length );
      			for ( ; i < length; i++ ) {
      				if ( resolveValues[ i ] && jQuery.isFunction( resolveValues[ i ].promise ) ) {
      					resolveValues[ i ].promise()
      						.done( updateFunc( i, resolveContexts, resolveValues ) )
      						.fail( deferred.reject )
      						.progress( updateFunc( i, progressContexts, progressValues ) );
      				} else {
      					--remaining;
      				}
      			}
      		}
      
      		// if we're not waiting on anything, resolve the master
      		if ( !remaining ) {
      			deferred.resolveWith( resolveContexts, resolveValues );
      		}
      
      		return deferred.promise();
      	}
      });
      jQuery.support = (function( support ) {
      	var input = document.createElement("input"),
      		fragment = document.createDocumentFragment(),
      		div = document.createElement("div"),
      		select = document.createElement("select"),
      		opt = select.appendChild( document.createElement("option") );
      
      	// Finish early in limited environments
      	if ( !input.type ) {
      		return support;
      	}
      
      	input.type = "checkbox";
      
      	// Support: Safari 5.1, iOS 5.1, Android 4.x, Android 2.3
      	// Check the default checkbox/radio value ("" on old WebKit; "on" elsewhere)
      	support.checkOn = input.value !== "";
      
      	// Must access the parent to make an option select properly
      	// Support: IE9, IE10
      	support.optSelected = opt.selected;
      
      	// Will be defined later
      	support.reliableMarginRight = true;
      	support.boxSizingReliable = true;
      	support.pixelPosition = false;
      
      	// Make sure checked status is properly cloned
      	// Support: IE9, IE10
      	input.checked = true;
      	support.noCloneChecked = input.cloneNode( true ).checked;
      
      	// Make sure that the options inside disabled selects aren't marked as disabled
      	// (WebKit marks them as disabled)
      	select.disabled = true;
      	support.optDisabled = !opt.disabled;
      
      	// Check if an input maintains its value after becoming a radio
      	// Support: IE9, IE10
      	input = document.createElement("input");
      	input.value = "t";
      	input.type = "radio";
      	support.radioValue = input.value === "t";
      
      	// #11217 - WebKit loses check when the name is after the checked attribute
      	input.setAttribute( "checked", "t" );
      	input.setAttribute( "name", "t" );
      
      	fragment.appendChild( input );
      
      	// Support: Safari 5.1, Android 4.x, Android 2.3
      	// old WebKit doesn't clone checked state correctly in fragments
      	support.checkClone = fragment.cloneNode( true ).cloneNode( true ).lastChild.checked;
      
      	// Support: Firefox, Chrome, Safari
      	// Beware of CSP restrictions (https://developer.mozilla.org/en/Security/CSP)
      	support.focusinBubbles = "onfocusin" in window;
      
      	div.style.backgroundClip = "content-box";
      	div.cloneNode( true ).style.backgroundClip = "";
      	support.clearCloneStyle = div.style.backgroundClip === "content-box";
      
      	// Run tests that need a body at doc ready
      	jQuery(function() {
      		var container, marginDiv,
      			// Support: Firefox, Android 2.3 (Prefixed box-sizing versions).
      			divReset = "padding:0;margin:0;border:0;display:block;-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box",
      			body = document.getElementsByTagName("body")[ 0 ];
      
      		if ( !body ) {
      			// Return for frameset docs that don't have a body
      			return;
      		}
      
      		container = document.createElement("div");
      		container.style.cssText = "border:0;width:0;height:0;position:absolute;top:0;left:-9999px;margin-top:1px";
      
      		// Check box-sizing and margin behavior.
      		body.appendChild( container ).appendChild( div );
      		div.innerHTML = "";
      		// Support: Firefox, Android 2.3 (Prefixed box-sizing versions).
      		div.style.cssText = "-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;position:absolute;top:1%";
      
      		// Workaround failing boxSizing test due to offsetWidth returning wrong value
      		// with some non-1 values of body zoom, ticket #13543
      		jQuery.swap( body, body.style.zoom != null ? { zoom: 1 } : {}, function() {
      			support.boxSizing = div.offsetWidth === 4;
      		});
      
      		// Use window.getComputedStyle because jsdom on node.js will break without it.
      		if ( window.getComputedStyle ) {
      			support.pixelPosition = ( window.getComputedStyle( div, null ) || {} ).top !== "1%";
      			support.boxSizingReliable = ( window.getComputedStyle( div, null ) || { width: "4px" } ).width === "4px";
      
      			// Support: Android 2.3
      			// Check if div with explicit width and no margin-right incorrectly
      			// gets computed margin-right based on width of container. (#3333)
      			// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
      			marginDiv = div.appendChild( document.createElement("div") );
      			marginDiv.style.cssText = div.style.cssText = divReset;
      			marginDiv.style.marginRight = marginDiv.style.width = "0";
      			div.style.width = "1px";
      
      			support.reliableMarginRight =
      				!parseFloat( ( window.getComputedStyle( marginDiv, null ) || {} ).marginRight );
      		}
      
      		body.removeChild( container );
      	});
      
      	return support;
      })( {} );
      
      /*
      	Implementation Summary
      
      	1. Enforce API surface and semantic compatibility with 1.9.x branch
      	2. Improve the module's maintainability by reducing the storage
      		paths to a single mechanism.
      	3. Use the same single mechanism to support "private" and "user" data.
      	4. _Never_ expose "private" data to user code (TODO: Drop _data, _removeData)
      	5. Avoid exposing implementation details on user objects (eg. expando properties)
      	6. Provide a clear path for implementation upgrade to WeakMap in 2014
      */
      var data_user, data_priv,
      	rbrace = /(?:\{[\s\S]*\}|\[[\s\S]*\])$/,
      	rmultiDash = /([A-Z])/g;
      
      function Data() {
      	// Support: Android < 4,
      	// Old WebKit does not have Object.preventExtensions/freeze method,
      	// return new empty object instead with no [[set]] accessor
      	Object.defineProperty( this.cache = {}, 0, {
      		get: function() {
      			return {};
      		}
      	});
      
      	this.expando = jQuery.expando + Math.random();
      }
      
      Data.uid = 1;
      
      Data.accepts = function( owner ) {
      	// Accepts only:
      	//  - Node
      	//    - Node.ELEMENT_NODE
      	//    - Node.DOCUMENT_NODE
      	//  - Object
      	//    - Any
      	return owner.nodeType ?
      		owner.nodeType === 1 || owner.nodeType === 9 : true;
      };
      
      Data.prototype = {
      	key: function( owner ) {
      		// We can accept data for non-element nodes in modern browsers,
      		// but we should not, see #8335.
      		// Always return the key for a frozen object.
      		if ( !Data.accepts( owner ) ) {
      			return 0;
      		}
      
      		var descriptor = {},
      			// Check if the owner object already has a cache key
      			unlock = owner[ this.expando ];
      
      		// If not, create one
      		if ( !unlock ) {
      			unlock = Data.uid++;
      
      			// Secure it in a non-enumerable, non-writable property
      			try {
      				descriptor[ this.expando ] = { value: unlock };
      				Object.defineProperties( owner, descriptor );
      
      			// Support: Android < 4
      			// Fallback to a less secure definition
      			} catch ( e ) {
      				descriptor[ this.expando ] = unlock;
      				jQuery.extend( owner, descriptor );
      			}
      		}
      
      		// Ensure the cache object
      		if ( !this.cache[ unlock ] ) {
      			this.cache[ unlock ] = {};
      		}
      
      		return unlock;
      	},
      	set: function( owner, data, value ) {
      		var prop,
      			// There may be an unlock assigned to this node,
      			// if there is no entry for this "owner", create one inline
      			// and set the unlock as though an owner entry had always existed
      			unlock = this.key( owner ),
      			cache = this.cache[ unlock ];
      
      		// Handle: [ owner, key, value ] args
      		if ( typeof data === "string" ) {
      			cache[ data ] = value;
      
      		// Handle: [ owner, { properties } ] args
      		} else {
      			// Fresh assignments by object are shallow copied
      			if ( jQuery.isEmptyObject( cache ) ) {
      				jQuery.extend( this.cache[ unlock ], data );
      			// Otherwise, copy the properties one-by-one to the cache object
      			} else {
      				for ( prop in data ) {
      					cache[ prop ] = data[ prop ];
      				}
      			}
      		}
      		return cache;
      	},
      	get: function( owner, key ) {
      		// Either a valid cache is found, or will be created.
      		// New caches will be created and the unlock returned,
      		// allowing direct access to the newly created
      		// empty data object. A valid owner object must be provided.
      		var cache = this.cache[ this.key( owner ) ];
      
      		return key === undefined ?
      			cache : cache[ key ];
      	},
      	access: function( owner, key, value ) {
      		var stored;
      		// In cases where either:
      		//
      		//   1. No key was specified
      		//   2. A string key was specified, but no value provided
      		//
      		// Take the "read" path and allow the get method to determine
      		// which value to return, respectively either:
      		//
      		//   1. The entire cache object
      		//   2. The data stored at the key
      		//
      		if ( key === undefined ||
      				((key && typeof key === "string") && value === undefined) ) {
      
      			stored = this.get( owner, key );
      
      			return stored !== undefined ?
      				stored : this.get( owner, jQuery.camelCase(key) );
      		}
      
      		// [*]When the key is not a string, or both a key and value
      		// are specified, set or extend (existing objects) with either:
      		//
      		//   1. An object of properties
      		//   2. A key and value
      		//
      		this.set( owner, key, value );
      
      		// Since the "set" path can have two possible entry points
      		// return the expected data based on which path was taken[*]
      		return value !== undefined ? value : key;
      	},
      	remove: function( owner, key ) {
      		var i, name, camel,
      			unlock = this.key( owner ),
      			cache = this.cache[ unlock ];
      
      		if ( key === undefined ) {
      			this.cache[ unlock ] = {};
      
      		} else {
      			// Support array or space separated string of keys
      			if ( jQuery.isArray( key ) ) {
      				// If "name" is an array of keys...
      				// When data is initially created, via ("key", "val") signature,
      				// keys will be converted to camelCase.
      				// Since there is no way to tell _how_ a key was added, remove
      				// both plain key and camelCase key. #12786
      				// This will only penalize the array argument path.
      				name = key.concat( key.map( jQuery.camelCase ) );
      			} else {
      				camel = jQuery.camelCase( key );
      				// Try the string as a key before any manipulation
      				if ( key in cache ) {
      					name = [ key, camel ];
      				} else {
      					// If a key with the spaces exists, use it.
      					// Otherwise, create an array by matching non-whitespace
      					name = camel;
      					name = name in cache ?
      						[ name ] : ( name.match( core_rnotwhite ) || [] );
      				}
      			}
      
      			i = name.length;
      			while ( i-- ) {
      				delete cache[ name[ i ] ];
      			}
      		}
      	},
      	hasData: function( owner ) {
      		return !jQuery.isEmptyObject(
      			this.cache[ owner[ this.expando ] ] || {}
      		);
      	},
      	discard: function( owner ) {
      		if ( owner[ this.expando ] ) {
      			delete this.cache[ owner[ this.expando ] ];
      		}
      	}
      };
      
      // These may be used throughout the jQuery core codebase
      data_user = new Data();
      data_priv = new Data();
      
      
      jQuery.extend({
      	acceptData: Data.accepts,
      
      	hasData: function( elem ) {
      		return data_user.hasData( elem ) || data_priv.hasData( elem );
      	},
      
      	data: function( elem, name, data ) {
      		return data_user.access( elem, name, data );
      	},
      
      	removeData: function( elem, name ) {
      		data_user.remove( elem, name );
      	},
      
      	// TODO: Now that all calls to _data and _removeData have been replaced
      	// with direct calls to data_priv methods, these can be deprecated.
      	_data: function( elem, name, data ) {
      		return data_priv.access( elem, name, data );
      	},
      
      	_removeData: function( elem, name ) {
      		data_priv.remove( elem, name );
      	}
      });
      
      jQuery.fn.extend({
      	data: function( key, value ) {
      		var attrs, name,
      			elem = this[ 0 ],
      			i = 0,
      			data = null;
      
      		// Gets all values
      		if ( key === undefined ) {
      			if ( this.length ) {
      				data = data_user.get( elem );
      
      				if ( elem.nodeType === 1 && !data_priv.get( elem, "hasDataAttrs" ) ) {
      					attrs = elem.attributes;
      					for ( ; i < attrs.length; i++ ) {
      						name = attrs[ i ].name;
      
      						if ( name.indexOf( "data-" ) === 0 ) {
      							name = jQuery.camelCase( name.slice(5) );
      							dataAttr( elem, name, data[ name ] );
      						}
      					}
      					data_priv.set( elem, "hasDataAttrs", true );
      				}
      			}
      
      			return data;
      		}
      
      		// Sets multiple values
      		if ( typeof key === "object" ) {
      			return this.each(function() {
      				data_user.set( this, key );
      			});
      		}
      
      		return jQuery.access( this, function( value ) {
      			var data,
      				camelKey = jQuery.camelCase( key );
      
      			// The calling jQuery object (element matches) is not empty
      			// (and therefore has an element appears at this[ 0 ]) and the
      			// `value` parameter was not undefined. An empty jQuery object
      			// will result in `undefined` for elem = this[ 0 ] which will
      			// throw an exception if an attempt to read a data cache is made.
      			if ( elem && value === undefined ) {
      				// Attempt to get data from the cache
      				// with the key as-is
      				data = data_user.get( elem, key );
      				if ( data !== undefined ) {
      					return data;
      				}
      
      				// Attempt to get data from the cache
      				// with the key camelized
      				data = data_user.get( elem, camelKey );
      				if ( data !== undefined ) {
      					return data;
      				}
      
      				// Attempt to "discover" the data in
      				// HTML5 custom data-* attrs
      				data = dataAttr( elem, camelKey, undefined );
      				if ( data !== undefined ) {
      					return data;
      				}
      
      				// We tried really hard, but the data doesn't exist.
      				return;
      			}
      
      			// Set the data...
      			this.each(function() {
      				// First, attempt to store a copy or reference of any
      				// data that might've been store with a camelCased key.
      				var data = data_user.get( this, camelKey );
      
      				// For HTML5 data-* attribute interop, we have to
      				// store property names with dashes in a camelCase form.
      				// This might not apply to all properties...*
      				data_user.set( this, camelKey, value );
      
      				// *... In the case of properties that might _actually_
      				// have dashes, we need to also store a copy of that
      				// unchanged property.
      				if ( key.indexOf("-") !== -1 && data !== undefined ) {
      					data_user.set( this, key, value );
      				}
      			});
      		}, null, value, arguments.length > 1, null, true );
      	},
      
      	removeData: function( key ) {
      		return this.each(function() {
      			data_user.remove( this, key );
      		});
      	}
      });
      
      function dataAttr( elem, key, data ) {
      	var name;
      
      	// If nothing was found internally, try to fetch any
      	// data from the HTML5 data-* attribute
      	if ( data === undefined && elem.nodeType === 1 ) {
      		name = "data-" + key.replace( rmultiDash, "-$1" ).toLowerCase();
      		data = elem.getAttribute( name );
      
      		if ( typeof data === "string" ) {
      			try {
      				data = data === "true" ? true :
      					data === "false" ? false :
      					data === "null" ? null :
      					// Only convert to a number if it doesn't change the string
      					+data + "" === data ? +data :
      					rbrace.test( data ) ? JSON.parse( data ) :
      					data;
      			} catch( e ) {}
      
      			// Make sure we set the data so it isn't changed later
      			data_user.set( elem, key, data );
      		} else {
      			data = undefined;
      		}
      	}
      	return data;
      }
      jQuery.extend({
      	queue: function( elem, type, data ) {
      		var queue;
      
      		if ( elem ) {
      			type = ( type || "fx" ) + "queue";
      			queue = data_priv.get( elem, type );
      
      			// Speed up dequeue by getting out quickly if this is just a lookup
      			if ( data ) {
      				if ( !queue || jQuery.isArray( data ) ) {
      					queue = data_priv.access( elem, type, jQuery.makeArray(data) );
      				} else {
      					queue.push( data );
      				}
      			}
      			return queue || [];
      		}
      	},
      
      	dequeue: function( elem, type ) {
      		type = type || "fx";
      
      		var queue = jQuery.queue( elem, type ),
      			startLength = queue.length,
      			fn = queue.shift(),
      			hooks = jQuery._queueHooks( elem, type ),
      			next = function() {
      				jQuery.dequeue( elem, type );
      			};
      
      		// If the fx queue is dequeued, always remove the progress sentinel
      		if ( fn === "inprogress" ) {
      			fn = queue.shift();
      			startLength--;
      		}
      
      		if ( fn ) {
      
      			// Add a progress sentinel to prevent the fx queue from being
      			// automatically dequeued
      			if ( type === "fx" ) {
      				queue.unshift( "inprogress" );
      			}
      
      			// clear up the last queue stop function
      			delete hooks.stop;
      			fn.call( elem, next, hooks );
      		}
      
      		if ( !startLength && hooks ) {
      			hooks.empty.fire();
      		}
      	},
      
      	// not intended for public consumption - generates a queueHooks object, or returns the current one
      	_queueHooks: function( elem, type ) {
      		var key = type + "queueHooks";
      		return data_priv.get( elem, key ) || data_priv.access( elem, key, {
      			empty: jQuery.Callbacks("once memory").add(function() {
      				data_priv.remove( elem, [ type + "queue", key ] );
      			})
      		});
      	}
      });
      
      jQuery.fn.extend({
      	queue: function( type, data ) {
      		var setter = 2;
      
      		if ( typeof type !== "string" ) {
      			data = type;
      			type = "fx";
      			setter--;
      		}
      
      		if ( arguments.length < setter ) {
      			return jQuery.queue( this[0], type );
      		}
      
      		return data === undefined ?
      			this :
      			this.each(function() {
      				var queue = jQuery.queue( this, type, data );
      
      				// ensure a hooks for this queue
      				jQuery._queueHooks( this, type );
      
      				if ( type === "fx" && queue[0] !== "inprogress" ) {
      					jQuery.dequeue( this, type );
      				}
      			});
      	},
      	dequeue: function( type ) {
      		return this.each(function() {
      			jQuery.dequeue( this, type );
      		});
      	},
      	// Based off of the plugin by Clint Helfers, with permission.
      	// http://blindsignals.com/index.php/2009/07/jquery-delay/
      	delay: function( time, type ) {
      		time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
      		type = type || "fx";
      
      		return this.queue( type, function( next, hooks ) {
      			var timeout = setTimeout( next, time );
      			hooks.stop = function() {
      				clearTimeout( timeout );
      			};
      		});
      	},
      	clearQueue: function( type ) {
      		return this.queue( type || "fx", [] );
      	},
      	// Get a promise resolved when queues of a certain type
      	// are emptied (fx is the type by default)
      	promise: function( type, obj ) {
      		var tmp,
      			count = 1,
      			defer = jQuery.Deferred(),
      			elements = this,
      			i = this.length,
      			resolve = function() {
      				if ( !( --count ) ) {
      					defer.resolveWith( elements, [ elements ] );
      				}
      			};
      
      		if ( typeof type !== "string" ) {
      			obj = type;
      			type = undefined;
      		}
      		type = type || "fx";
      
      		while( i-- ) {
      			tmp = data_priv.get( elements[ i ], type + "queueHooks" );
      			if ( tmp && tmp.empty ) {
      				count++;
      				tmp.empty.add( resolve );
      			}
      		}
      		resolve();
      		return defer.promise( obj );
      	}
      });
      var nodeHook, boolHook,
      	rclass = /[\t\r\n\f]/g,
      	rreturn = /\r/g,
      	rfocusable = /^(?:input|select|textarea|button)$/i;
      
      jQuery.fn.extend({
      	attr: function( name, value ) {
      		return jQuery.access( this, jQuery.attr, name, value, arguments.length > 1 );
      	},
      
      	removeAttr: function( name ) {
      		return this.each(function() {
      			jQuery.removeAttr( this, name );
      		});
      	},
      
      	prop: function( name, value ) {
      		return jQuery.access( this, jQuery.prop, name, value, arguments.length > 1 );
      	},
      
      	removeProp: function( name ) {
      		return this.each(function() {
      			delete this[ jQuery.propFix[ name ] || name ];
      		});
      	},
      
      	addClass: function( value ) {
      		var classes, elem, cur, clazz, j,
      			i = 0,
      			len = this.length,
      			proceed = typeof value === "string" && value;
      
      		if ( jQuery.isFunction( value ) ) {
      			return this.each(function( j ) {
      				jQuery( this ).addClass( value.call( this, j, this.className ) );
      			});
      		}
      
      		if ( proceed ) {
      			// The disjunction here is for better compressibility (see removeClass)
      			classes = ( value || "" ).match( core_rnotwhite ) || [];
      
      			for ( ; i < len; i++ ) {
      				elem = this[ i ];
      				cur = elem.nodeType === 1 && ( elem.className ?
      					( " " + elem.className + " " ).replace( rclass, " " ) :
      					" "
      				);
      
      				if ( cur ) {
      					j = 0;
      					while ( (clazz = classes[j++]) ) {
      						if ( cur.indexOf( " " + clazz + " " ) < 0 ) {
      							cur += clazz + " ";
      						}
      					}
      					elem.className = jQuery.trim( cur );
      
      				}
      			}
      		}
      
      		return this;
      	},
      
      	removeClass: function( value ) {
      		var classes, elem, cur, clazz, j,
      			i = 0,
      			len = this.length,
      			proceed = arguments.length === 0 || typeof value === "string" && value;
      
      		if ( jQuery.isFunction( value ) ) {
      			return this.each(function( j ) {
      				jQuery( this ).removeClass( value.call( this, j, this.className ) );
      			});
      		}
      		if ( proceed ) {
      			classes = ( value || "" ).match( core_rnotwhite ) || [];
      
      			for ( ; i < len; i++ ) {
      				elem = this[ i ];
      				// This expression is here for better compressibility (see addClass)
      				cur = elem.nodeType === 1 && ( elem.className ?
      					( " " + elem.className + " " ).replace( rclass, " " ) :
      					""
      				);
      
      				if ( cur ) {
      					j = 0;
      					while ( (clazz = classes[j++]) ) {
      						// Remove *all* instances
      						while ( cur.indexOf( " " + clazz + " " ) >= 0 ) {
      							cur = cur.replace( " " + clazz + " ", " " );
      						}
      					}
      					elem.className = value ? jQuery.trim( cur ) : "";
      				}
      			}
      		}
      
      		return this;
      	},
      
      	toggleClass: function( value, stateVal ) {
      		var type = typeof value;
      
      		if ( typeof stateVal === "boolean" && type === "string" ) {
      			return stateVal ? this.addClass( value ) : this.removeClass( value );
      		}
      
      		if ( jQuery.isFunction( value ) ) {
      			return this.each(function( i ) {
      				jQuery( this ).toggleClass( value.call(this, i, this.className, stateVal), stateVal );
      			});
      		}
      
      		return this.each(function() {
      			if ( type === "string" ) {
      				// toggle individual class names
      				var className,
      					i = 0,
      					self = jQuery( this ),
      					classNames = value.match( core_rnotwhite ) || [];
      
      				while ( (className = classNames[ i++ ]) ) {
      					// check each className given, space separated list
      					if ( self.hasClass( className ) ) {
      						self.removeClass( className );
      					} else {
      						self.addClass( className );
      					}
      				}
      
      			// Toggle whole class name
      			} else if ( type === core_strundefined || type === "boolean" ) {
      				if ( this.className ) {
      					// store className if set
      					data_priv.set( this, "__className__", this.className );
      				}
      
      				// If the element has a class name or if we're passed "false",
      				// then remove the whole classname (if there was one, the above saved it).
      				// Otherwise bring back whatever was previously saved (if anything),
      				// falling back to the empty string if nothing was stored.
      				this.className = this.className || value === false ? "" : data_priv.get( this, "__className__" ) || "";
      			}
      		});
      	},
      
      	hasClass: function( selector ) {
      		var className = " " + selector + " ",
      			i = 0,
      			l = this.length;
      		for ( ; i < l; i++ ) {
      			if ( this[i].nodeType === 1 && (" " + this[i].className + " ").replace(rclass, " ").indexOf( className ) >= 0 ) {
      				return true;
      			}
      		}
      
      		return false;
      	},
      
      	val: function( value ) {
      		var hooks, ret, isFunction,
      			elem = this[0];
      
      		if ( !arguments.length ) {
      			if ( elem ) {
      				hooks = jQuery.valHooks[ elem.type ] || jQuery.valHooks[ elem.nodeName.toLowerCase() ];
      
      				if ( hooks && "get" in hooks && (ret = hooks.get( elem, "value" )) !== undefined ) {
      					return ret;
      				}
      
      				ret = elem.value;
      
      				return typeof ret === "string" ?
      					// handle most common string cases
      					ret.replace(rreturn, "") :
      					// handle cases where value is null/undef or number
      					ret == null ? "" : ret;
      			}
      
      			return;
      		}
      
      		isFunction = jQuery.isFunction( value );
      
      		return this.each(function( i ) {
      			var val;
      
      			if ( this.nodeType !== 1 ) {
      				return;
      			}
      
      			if ( isFunction ) {
      				val = value.call( this, i, jQuery( this ).val() );
      			} else {
      				val = value;
      			}
      
      			// Treat null/undefined as ""; convert numbers to string
      			if ( val == null ) {
      				val = "";
      			} else if ( typeof val === "number" ) {
      				val += "";
      			} else if ( jQuery.isArray( val ) ) {
      				val = jQuery.map(val, function ( value ) {
      					return value == null ? "" : value + "";
      				});
      			}
      
      			hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];
      
      			// If set returns undefined, fall back to normal setting
      			if ( !hooks || !("set" in hooks) || hooks.set( this, val, "value" ) === undefined ) {
      				this.value = val;
      			}
      		});
      	}
      });
      
      jQuery.extend({
      	valHooks: {
      		option: {
      			get: function( elem ) {
      				// attributes.value is undefined in Blackberry 4.7 but
      				// uses .value. See #6932
      				var val = elem.attributes.value;
      				return !val || val.specified ? elem.value : elem.text;
      			}
      		},
      		select: {
      			get: function( elem ) {
      				var value, option,
      					options = elem.options,
      					index = elem.selectedIndex,
      					one = elem.type === "select-one" || index < 0,
      					values = one ? null : [],
      					max = one ? index + 1 : options.length,
      					i = index < 0 ?
      						max :
      						one ? index : 0;
      
      				// Loop through all the selected options
      				for ( ; i < max; i++ ) {
      					option = options[ i ];
      
      					// IE6-9 doesn't update selected after form reset (#2551)
      					if ( ( option.selected || i === index ) &&
      							// Don't return options that are disabled or in a disabled optgroup
      							( jQuery.support.optDisabled ? !option.disabled : option.getAttribute("disabled") === null ) &&
      							( !option.parentNode.disabled || !jQuery.nodeName( option.parentNode, "optgroup" ) ) ) {
      
      						// Get the specific value for the option
      						value = jQuery( option ).val();
      
      						// We don't need an array for one selects
      						if ( one ) {
      							return value;
      						}
      
      						// Multi-Selects return an array
      						values.push( value );
      					}
      				}
      
      				return values;
      			},
      
      			set: function( elem, value ) {
      				var optionSet, option,
      					options = elem.options,
      					values = jQuery.makeArray( value ),
      					i = options.length;
      
      				while ( i-- ) {
      					option = options[ i ];
      					if ( (option.selected = jQuery.inArray( jQuery(option).val(), values ) >= 0) ) {
      						optionSet = true;
      					}
      				}
      
      				// force browsers to behave consistently when non-matching value is set
      				if ( !optionSet ) {
      					elem.selectedIndex = -1;
      				}
      				return values;
      			}
      		}
      	},
      
      	attr: function( elem, name, value ) {
      		var hooks, ret,
      			nType = elem.nodeType;
      
      		// don't get/set attributes on text, comment and attribute nodes
      		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
      			return;
      		}
      
      		// Fallback to prop when attributes are not supported
      		if ( typeof elem.getAttribute === core_strundefined ) {
      			return jQuery.prop( elem, name, value );
      		}
      
      		// All attributes are lowercase
      		// Grab necessary hook if one is defined
      		if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {
      			name = name.toLowerCase();
      			hooks = jQuery.attrHooks[ name ] ||
      				( jQuery.expr.match.bool.test( name ) ? boolHook : nodeHook );
      		}
      
      		if ( value !== undefined ) {
      
      			if ( value === null ) {
      				jQuery.removeAttr( elem, name );
      
      			} else if ( hooks && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ) {
      				return ret;
      
      			} else {
      				elem.setAttribute( name, value + "" );
      				return value;
      			}
      
      		} else if ( hooks && "get" in hooks && (ret = hooks.get( elem, name )) !== null ) {
      			return ret;
      
      		} else {
      			ret = jQuery.find.attr( elem, name );
      
      			// Non-existent attributes return null, we normalize to undefined
      			return ret == null ?
      				undefined :
      				ret;
      		}
      	},
      
      	removeAttr: function( elem, value ) {
      		var name, propName,
      			i = 0,
      			attrNames = value && value.match( core_rnotwhite );
      
      		if ( attrNames && elem.nodeType === 1 ) {
      			while ( (name = attrNames[i++]) ) {
      				propName = jQuery.propFix[ name ] || name;
      
      				// Boolean attributes get special treatment (#10870)
      				if ( jQuery.expr.match.bool.test( name ) ) {
      					// Set corresponding property to false
      					elem[ propName ] = false;
      				}
      
      				elem.removeAttribute( name );
      			}
      		}
      	},
      
      	attrHooks: {
      		type: {
      			set: function( elem, value ) {
      				if ( !jQuery.support.radioValue && value === "radio" && jQuery.nodeName(elem, "input") ) {
      					// Setting the type on a radio button after the value resets the value in IE6-9
      					// Reset value to default in case type is set after value during creation
      					var val = elem.value;
      					elem.setAttribute( "type", value );
      					if ( val ) {
      						elem.value = val;
      					}
      					return value;
      				}
      			}
      		}
      	},
      
      	propFix: {
      		"for": "htmlFor",
      		"class": "className"
      	},
      
      	prop: function( elem, name, value ) {
      		var ret, hooks, notxml,
      			nType = elem.nodeType;
      
      		// don't get/set properties on text, comment and attribute nodes
      		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
      			return;
      		}
      
      		notxml = nType !== 1 || !jQuery.isXMLDoc( elem );
      
      		if ( notxml ) {
      			// Fix name and attach hooks
      			name = jQuery.propFix[ name ] || name;
      			hooks = jQuery.propHooks[ name ];
      		}
      
      		if ( value !== undefined ) {
      			return hooks && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ?
      				ret :
      				( elem[ name ] = value );
      
      		} else {
      			return hooks && "get" in hooks && (ret = hooks.get( elem, name )) !== null ?
      				ret :
      				elem[ name ];
      		}
      	},
      
      	propHooks: {
      		tabIndex: {
      			get: function( elem ) {
      				return elem.hasAttribute( "tabindex" ) || rfocusable.test( elem.nodeName ) || elem.href ?
      					elem.tabIndex :
      					-1;
      			}
      		}
      	}
      });
      
      // Hooks for boolean attributes
      boolHook = {
      	set: function( elem, value, name ) {
      		if ( value === false ) {
      			// Remove boolean attributes when set to false
      			jQuery.removeAttr( elem, name );
      		} else {
      			elem.setAttribute( name, name );
      		}
      		return name;
      	}
      };
      jQuery.each( jQuery.expr.match.bool.source.match( /\w+/g ), function( i, name ) {
      	var getter = jQuery.expr.attrHandle[ name ] || jQuery.find.attr;
      
      	jQuery.expr.attrHandle[ name ] = function( elem, name, isXML ) {
      		var fn = jQuery.expr.attrHandle[ name ],
      			ret = isXML ?
      				undefined :
      				/* jshint eqeqeq: false */
      				// Temporarily disable this handler to check existence
      				(jQuery.expr.attrHandle[ name ] = undefined) !=
      					getter( elem, name, isXML ) ?
      
      					name.toLowerCase() :
      					null;
      
      		// Restore handler
      		jQuery.expr.attrHandle[ name ] = fn;
      
      		return ret;
      	};
      });
      
      // Support: IE9+
      // Selectedness for an option in an optgroup can be inaccurate
      if ( !jQuery.support.optSelected ) {
      	jQuery.propHooks.selected = {
      		get: function( elem ) {
      			var parent = elem.parentNode;
      			if ( parent && parent.parentNode ) {
      				parent.parentNode.selectedIndex;
      			}
      			return null;
      		}
      	};
      }
      
      jQuery.each([
      	"tabIndex",
      	"readOnly",
      	"maxLength",
      	"cellSpacing",
      	"cellPadding",
      	"rowSpan",
      	"colSpan",
      	"useMap",
      	"frameBorder",
      	"contentEditable"
      ], function() {
      	jQuery.propFix[ this.toLowerCase() ] = this;
      });
      
      // Radios and checkboxes getter/setter
      jQuery.each([ "radio", "checkbox" ], function() {
      	jQuery.valHooks[ this ] = {
      		set: function( elem, value ) {
      			if ( jQuery.isArray( value ) ) {
      				return ( elem.checked = jQuery.inArray( jQuery(elem).val(), value ) >= 0 );
      			}
      		}
      	};
      	if ( !jQuery.support.checkOn ) {
      		jQuery.valHooks[ this ].get = function( elem ) {
      			// Support: Webkit
      			// "" is returned instead of "on" if a value isn't specified
      			return elem.getAttribute("value") === null ? "on" : elem.value;
      		};
      	}
      });
      var rkeyEvent = /^key/,
      	rmouseEvent = /^(?:mouse|contextmenu)|click/,
      	rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
      	rtypenamespace = /^([^.]*)(?:\.(.+)|)$/;
      
      function returnTrue() {
      	return true;
      }
      
      function returnFalse() {
      	return false;
      }
      
      function safeActiveElement() {
      	try {
      		return document.activeElement;
      	} catch ( err ) { }
      }
      
      /*
       * Helper functions for managing events -- not part of the public interface.
       * Props to Dean Edwards' addEvent library for many of the ideas.
       */
      jQuery.event = {
      
      	global: {},
      
      	add: function( elem, types, handler, data, selector ) {
      
      		var handleObjIn, eventHandle, tmp,
      			events, t, handleObj,
      			special, handlers, type, namespaces, origType,
      			elemData = data_priv.get( elem );
      
      		// Don't attach events to noData or text/comment nodes (but allow plain objects)
      		if ( !elemData ) {
      			return;
      		}
      
      		// Caller can pass in an object of custom data in lieu of the handler
      		if ( handler.handler ) {
      			handleObjIn = handler;
      			handler = handleObjIn.handler;
      			selector = handleObjIn.selector;
      		}
      
      		// Make sure that the handler has a unique ID, used to find/remove it later
      		if ( !handler.guid ) {
      			handler.guid = jQuery.guid++;
      		}
      
      		// Init the element's event structure and main handler, if this is the first
      		if ( !(events = elemData.events) ) {
      			events = elemData.events = {};
      		}
      		if ( !(eventHandle = elemData.handle) ) {
      			eventHandle = elemData.handle = function( e ) {
      				// Discard the second event of a jQuery.event.trigger() and
      				// when an event is called after a page has unloaded
      				return typeof jQuery !== core_strundefined && (!e || jQuery.event.triggered !== e.type) ?
      					jQuery.event.dispatch.apply( eventHandle.elem, arguments ) :
      					undefined;
      			};
      			// Add elem as a property of the handle fn to prevent a memory leak with IE non-native events
      			eventHandle.elem = elem;
      		}
      
      		// Handle multiple events separated by a space
      		types = ( types || "" ).match( core_rnotwhite ) || [""];
      		t = types.length;
      		while ( t-- ) {
      			tmp = rtypenamespace.exec( types[t] ) || [];
      			type = origType = tmp[1];
      			namespaces = ( tmp[2] || "" ).split( "." ).sort();
      
      			// There *must* be a type, no attaching namespace-only handlers
      			if ( !type ) {
      				continue;
      			}
      
      			// If event changes its type, use the special event handlers for the changed type
      			special = jQuery.event.special[ type ] || {};
      
      			// If selector defined, determine special event api type, otherwise given type
      			type = ( selector ? special.delegateType : special.bindType ) || type;
      
      			// Update special based on newly reset type
      			special = jQuery.event.special[ type ] || {};
      
      			// handleObj is passed to all event handlers
      			handleObj = jQuery.extend({
      				type: type,
      				origType: origType,
      				data: data,
      				handler: handler,
      				guid: handler.guid,
      				selector: selector,
      				needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
      				namespace: namespaces.join(".")
      			}, handleObjIn );
      
      			// Init the event handler queue if we're the first
      			if ( !(handlers = events[ type ]) ) {
      				handlers = events[ type ] = [];
      				handlers.delegateCount = 0;
      
      				// Only use addEventListener if the special events handler returns false
      				if ( !special.setup || special.setup.call( elem, data, namespaces, eventHandle ) === false ) {
      					if ( elem.addEventListener ) {
      						elem.addEventListener( type, eventHandle, false );
      					}
      				}
      			}
      
      			if ( special.add ) {
      				special.add.call( elem, handleObj );
      
      				if ( !handleObj.handler.guid ) {
      					handleObj.handler.guid = handler.guid;
      				}
      			}
      
      			// Add to the element's handler list, delegates in front
      			if ( selector ) {
      				handlers.splice( handlers.delegateCount++, 0, handleObj );
      			} else {
      				handlers.push( handleObj );
      			}
      
      			// Keep track of which events have ever been used, for event optimization
      			jQuery.event.global[ type ] = true;
      		}
      
      		// Nullify elem to prevent memory leaks in IE
      		elem = null;
      	},
      
      	// Detach an event or set of events from an element
      	remove: function( elem, types, handler, selector, mappedTypes ) {
      
      		var j, origCount, tmp,
      			events, t, handleObj,
      			special, handlers, type, namespaces, origType,
      			elemData = data_priv.hasData( elem ) && data_priv.get( elem );
      
      		if ( !elemData || !(events = elemData.events) ) {
      			return;
      		}
      
      		// Once for each type.namespace in types; type may be omitted
      		types = ( types || "" ).match( core_rnotwhite ) || [""];
      		t = types.length;
      		while ( t-- ) {
      			tmp = rtypenamespace.exec( types[t] ) || [];
      			type = origType = tmp[1];
      			namespaces = ( tmp[2] || "" ).split( "." ).sort();
      
      			// Unbind all events (on this namespace, if provided) for the element
      			if ( !type ) {
      				for ( type in events ) {
      					jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
      				}
      				continue;
      			}
      
      			special = jQuery.event.special[ type ] || {};
      			type = ( selector ? special.delegateType : special.bindType ) || type;
      			handlers = events[ type ] || [];
      			tmp = tmp[2] && new RegExp( "(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)" );
      
      			// Remove matching events
      			origCount = j = handlers.length;
      			while ( j-- ) {
      				handleObj = handlers[ j ];
      
      				if ( ( mappedTypes || origType === handleObj.origType ) &&
      					( !handler || handler.guid === handleObj.guid ) &&
      					( !tmp || tmp.test( handleObj.namespace ) ) &&
      					( !selector || selector === handleObj.selector || selector === "**" && handleObj.selector ) ) {
      					handlers.splice( j, 1 );
      
      					if ( handleObj.selector ) {
      						handlers.delegateCount--;
      					}
      					if ( special.remove ) {
      						special.remove.call( elem, handleObj );
      					}
      				}
      			}
      
      			// Remove generic event handler if we removed something and no more handlers exist
      			// (avoids potential for endless recursion during removal of special event handlers)
      			if ( origCount && !handlers.length ) {
      				if ( !special.teardown || special.teardown.call( elem, namespaces, elemData.handle ) === false ) {
      					jQuery.removeEvent( elem, type, elemData.handle );
      				}
      
      				delete events[ type ];
      			}
      		}
      
      		// Remove the expando if it's no longer used
      		if ( jQuery.isEmptyObject( events ) ) {
      			delete elemData.handle;
      			data_priv.remove( elem, "events" );
      		}
      	},
      
      	trigger: function( event, data, elem, onlyHandlers ) {
      
      		var i, cur, tmp, bubbleType, ontype, handle, special,
      			eventPath = [ elem || document ],
      			type = core_hasOwn.call( event, "type" ) ? event.type : event,
      			namespaces = core_hasOwn.call( event, "namespace" ) ? event.namespace.split(".") : [];
      
      		cur = tmp = elem = elem || document;
      
      		// Don't do events on text and comment nodes
      		if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
      			return;
      		}
      
      		// focus/blur morphs to focusin/out; ensure we're not firing them right now
      		if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
      			return;
      		}
      
      		if ( type.indexOf(".") >= 0 ) {
      			// Namespaced trigger; create a regexp to match event type in handle()
      			namespaces = type.split(".");
      			type = namespaces.shift();
      			namespaces.sort();
      		}
      		ontype = type.indexOf(":") < 0 && "on" + type;
      
      		// Caller can pass in a jQuery.Event object, Object, or just an event type string
      		event = event[ jQuery.expando ] ?
      			event :
      			new jQuery.Event( type, typeof event === "object" && event );
      
      		// Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)
      		event.isTrigger = onlyHandlers ? 2 : 3;
      		event.namespace = namespaces.join(".");
      		event.namespace_re = event.namespace ?
      			new RegExp( "(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)" ) :
      			null;
      
      		// Clean up the event in case it is being reused
      		event.result = undefined;
      		if ( !event.target ) {
      			event.target = elem;
      		}
      
      		// Clone any incoming data and prepend the event, creating the handler arg list
      		data = data == null ?
      			[ event ] :
      			jQuery.makeArray( data, [ event ] );
      
      		// Allow special events to draw outside the lines
      		special = jQuery.event.special[ type ] || {};
      		if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {
      			return;
      		}
      
      		// Determine event propagation path in advance, per W3C events spec (#9951)
      		// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
      		if ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) {
      
      			bubbleType = special.delegateType || type;
      			if ( !rfocusMorph.test( bubbleType + type ) ) {
      				cur = cur.parentNode;
      			}
      			for ( ; cur; cur = cur.parentNode ) {
      				eventPath.push( cur );
      				tmp = cur;
      			}
      
      			// Only add window if we got to document (e.g., not plain obj or detached DOM)
      			if ( tmp === (elem.ownerDocument || document) ) {
      				eventPath.push( tmp.defaultView || tmp.parentWindow || window );
      			}
      		}
      
      		// Fire handlers on the event path
      		i = 0;
      		while ( (cur = eventPath[i++]) && !event.isPropagationStopped() ) {
      
      			event.type = i > 1 ?
      				bubbleType :
      				special.bindType || type;
      
      			// jQuery handler
      			handle = ( data_priv.get( cur, "events" ) || {} )[ event.type ] && data_priv.get( cur, "handle" );
      			if ( handle ) {
      				handle.apply( cur, data );
      			}
      
      			// Native handler
      			handle = ontype && cur[ ontype ];
      			if ( handle && jQuery.acceptData( cur ) && handle.apply && handle.apply( cur, data ) === false ) {
      				event.preventDefault();
      			}
      		}
      		event.type = type;
      
      		// If nobody prevented the default action, do it now
      		if ( !onlyHandlers && !event.isDefaultPrevented() ) {
      
      			if ( (!special._default || special._default.apply( eventPath.pop(), data ) === false) &&
      				jQuery.acceptData( elem ) ) {
      
      				// Call a native DOM method on the target with the same name name as the event.
      				// Don't do default actions on window, that's where global variables be (#6170)
      				if ( ontype && jQuery.isFunction( elem[ type ] ) && !jQuery.isWindow( elem ) ) {
      
      					// Don't re-trigger an onFOO event when we call its FOO() method
      					tmp = elem[ ontype ];
      
      					if ( tmp ) {
      						elem[ ontype ] = null;
      					}
      
      					// Prevent re-triggering of the same event, since we already bubbled it above
      					jQuery.event.triggered = type;
      					elem[ type ]();
      					jQuery.event.triggered = undefined;
      
      					if ( tmp ) {
      						elem[ ontype ] = tmp;
      					}
      				}
      			}
      		}
      
      		return event.result;
      	},
      
      	dispatch: function( event ) {
      
      		// Make a writable jQuery.Event from the native event object
      		event = jQuery.event.fix( event );
      
      		var i, j, ret, matched, handleObj,
      			handlerQueue = [],
      			args = core_slice.call( arguments ),
      			handlers = ( data_priv.get( this, "events" ) || {} )[ event.type ] || [],
      			special = jQuery.event.special[ event.type ] || {};
      
      		// Use the fix-ed jQuery.Event rather than the (read-only) native event
      		args[0] = event;
      		event.delegateTarget = this;
      
      		// Call the preDispatch hook for the mapped type, and let it bail if desired
      		if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
      			return;
      		}
      
      		// Determine handlers
      		handlerQueue = jQuery.event.handlers.call( this, event, handlers );
      
      		// Run delegates first; they may want to stop propagation beneath us
      		i = 0;
      		while ( (matched = handlerQueue[ i++ ]) && !event.isPropagationStopped() ) {
      			event.currentTarget = matched.elem;
      
      			j = 0;
      			while ( (handleObj = matched.handlers[ j++ ]) && !event.isImmediatePropagationStopped() ) {
      
      				// Triggered event must either 1) have no namespace, or
      				// 2) have namespace(s) a subset or equal to those in the bound event (both can have no namespace).
      				if ( !event.namespace_re || event.namespace_re.test( handleObj.namespace ) ) {
      
      					event.handleObj = handleObj;
      					event.data = handleObj.data;
      
      					ret = ( (jQuery.event.special[ handleObj.origType ] || {}).handle || handleObj.handler )
      							.apply( matched.elem, args );
      
      					if ( ret !== undefined ) {
      						if ( (event.result = ret) === false ) {
      							event.preventDefault();
      							event.stopPropagation();
      						}
      					}
      				}
      			}
      		}
      
      		// Call the postDispatch hook for the mapped type
      		if ( special.postDispatch ) {
      			special.postDispatch.call( this, event );
      		}
      
      		return event.result;
      	},
      
      	handlers: function( event, handlers ) {
      		var i, matches, sel, handleObj,
      			handlerQueue = [],
      			delegateCount = handlers.delegateCount,
      			cur = event.target;
      
      		// Find delegate handlers
      		// Black-hole SVG <use> instance trees (#13180)
      		// Avoid non-left-click bubbling in Firefox (#3861)
      		if ( delegateCount && cur.nodeType && (!event.button || event.type !== "click") ) {
      
      			for ( ; cur !== this; cur = cur.parentNode || this ) {
      
      				// Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
      				if ( cur.disabled !== true || event.type !== "click" ) {
      					matches = [];
      					for ( i = 0; i < delegateCount; i++ ) {
      						handleObj = handlers[ i ];
      
      						// Don't conflict with Object.prototype properties (#13203)
      						sel = handleObj.selector + " ";
      
      						if ( matches[ sel ] === undefined ) {
      							matches[ sel ] = handleObj.needsContext ?
      								jQuery( sel, this ).index( cur ) >= 0 :
      								jQuery.find( sel, this, null, [ cur ] ).length;
      						}
      						if ( matches[ sel ] ) {
      							matches.push( handleObj );
      						}
      					}
      					if ( matches.length ) {
      						handlerQueue.push({ elem: cur, handlers: matches });
      					}
      				}
      			}
      		}
      
      		// Add the remaining (directly-bound) handlers
      		if ( delegateCount < handlers.length ) {
      			handlerQueue.push({ elem: this, handlers: handlers.slice( delegateCount ) });
      		}
      
      		return handlerQueue;
      	},
      
      	// Includes some event props shared by KeyEvent and MouseEvent
      	props: "altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),
      
      	fixHooks: {},
      
      	keyHooks: {
      		props: "char charCode key keyCode".split(" "),
      		filter: function( event, original ) {
      
      			// Add which for key events
      			if ( event.which == null ) {
      				event.which = original.charCode != null ? original.charCode : original.keyCode;
      			}
      
      			return event;
      		}
      	},
      
      	mouseHooks: {
      		props: "button buttons clientX clientY offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
      		filter: function( event, original ) {
      			var eventDoc, doc, body,
      				button = original.button;
      
      			// Calculate pageX/Y if missing and clientX/Y available
      			if ( event.pageX == null && original.clientX != null ) {
      				eventDoc = event.target.ownerDocument || document;
      				doc = eventDoc.documentElement;
      				body = eventDoc.body;
      
      				event.pageX = original.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && body.clientLeft || 0 );
      				event.pageY = original.clientY + ( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) - ( doc && doc.clientTop  || body && body.clientTop  || 0 );
      			}
      
      			// Add which for click: 1 === left; 2 === middle; 3 === right
      			// Note: button is not normalized, so don't use it
      			if ( !event.which && button !== undefined ) {
      				event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
      			}
      
      			return event;
      		}
      	},
      
      	fix: function( event ) {
      		if ( event[ jQuery.expando ] ) {
      			return event;
      		}
      
      		// Create a writable copy of the event object and normalize some properties
      		var i, prop, copy,
      			type = event.type,
      			originalEvent = event,
      			fixHook = this.fixHooks[ type ];
      
      		if ( !fixHook ) {
      			this.fixHooks[ type ] = fixHook =
      				rmouseEvent.test( type ) ? this.mouseHooks :
      				rkeyEvent.test( type ) ? this.keyHooks :
      				{};
      		}
      		copy = fixHook.props ? this.props.concat( fixHook.props ) : this.props;
      
      		event = new jQuery.Event( originalEvent );
      
      		i = copy.length;
      		while ( i-- ) {
      			prop = copy[ i ];
      			event[ prop ] = originalEvent[ prop ];
      		}
      
      		// Support: Cordova 2.5 (WebKit) (#13255)
      		// All events should have a target; Cordova deviceready doesn't
      		if ( !event.target ) {
      			event.target = document;
      		}
      
      		// Support: Safari 6.0+, Chrome < 28
      		// Target should not be a text node (#504, #13143)
      		if ( event.target.nodeType === 3 ) {
      			event.target = event.target.parentNode;
      		}
      
      		return fixHook.filter? fixHook.filter( event, originalEvent ) : event;
      	},
      
      	special: {
      		load: {
      			// Prevent triggered image.load events from bubbling to window.load
      			noBubble: true
      		},
      		focus: {
      			// Fire native event if possible so blur/focus sequence is correct
      			trigger: function() {
      				if ( this !== safeActiveElement() && this.focus ) {
      					this.focus();
      					return false;
      				}
      			},
      			delegateType: "focusin"
      		},
      		blur: {
      			trigger: function() {
      				if ( this === safeActiveElement() && this.blur ) {
      					this.blur();
      					return false;
      				}
      			},
      			delegateType: "focusout"
      		},
      		click: {
      			// For checkbox, fire native event so checked state will be right
      			trigger: function() {
      				if ( this.type === "checkbox" && this.click && jQuery.nodeName( this, "input" ) ) {
      					this.click();
      					return false;
      				}
      			},
      
      			// For cross-browser consistency, don't fire native .click() on links
      			_default: function( event ) {
      				return jQuery.nodeName( event.target, "a" );
      			}
      		},
      
      		beforeunload: {
      			postDispatch: function( event ) {
      
      				// Support: Firefox 20+
      				// Firefox doesn't alert if the returnValue field is not set.
      				if ( event.result !== undefined ) {
      					event.originalEvent.returnValue = event.result;
      				}
      			}
      		}
      	},
      
      	simulate: function( type, elem, event, bubble ) {
      		// Piggyback on a donor event to simulate a different one.
      		// Fake originalEvent to avoid donor's stopPropagation, but if the
      		// simulated event prevents default then we do the same on the donor.
      		var e = jQuery.extend(
      			new jQuery.Event(),
      			event,
      			{
      				type: type,
      				isSimulated: true,
      				originalEvent: {}
      			}
      		);
      		if ( bubble ) {
      			jQuery.event.trigger( e, null, elem );
      		} else {
      			jQuery.event.dispatch.call( elem, e );
      		}
      		if ( e.isDefaultPrevented() ) {
      			event.preventDefault();
      		}
      	}
      };
      
      jQuery.removeEvent = function( elem, type, handle ) {
      	if ( elem.removeEventListener ) {
      		elem.removeEventListener( type, handle, false );
      	}
      };
      
      jQuery.Event = function( src, props ) {
      	// Allow instantiation without the 'new' keyword
      	if ( !(this instanceof jQuery.Event) ) {
      		return new jQuery.Event( src, props );
      	}
      
      	// Event object
      	if ( src && src.type ) {
      		this.originalEvent = src;
      		this.type = src.type;
      
      		// Events bubbling up the document may have been marked as prevented
      		// by a handler lower down the tree; reflect the correct value.
      		this.isDefaultPrevented = ( src.defaultPrevented ||
      			src.getPreventDefault && src.getPreventDefault() ) ? returnTrue : returnFalse;
      
      	// Event type
      	} else {
      		this.type = src;
      	}
      
      	// Put explicitly provided properties onto the event object
      	if ( props ) {
      		jQuery.extend( this, props );
      	}
      
      	// Create a timestamp if incoming event doesn't have one
      	this.timeStamp = src && src.timeStamp || jQuery.now();
      
      	// Mark it as fixed
      	this[ jQuery.expando ] = true;
      };
      
      // jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
      // http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
      jQuery.Event.prototype = {
      	isDefaultPrevented: returnFalse,
      	isPropagationStopped: returnFalse,
      	isImmediatePropagationStopped: returnFalse,
      
      	preventDefault: function() {
      		var e = this.originalEvent;
      
      		this.isDefaultPrevented = returnTrue;
      
      		if ( e && e.preventDefault ) {
      			e.preventDefault();
      		}
      	},
      	stopPropagation: function() {
      		var e = this.originalEvent;
      
      		this.isPropagationStopped = returnTrue;
      
      		if ( e && e.stopPropagation ) {
      			e.stopPropagation();
      		}
      	},
      	stopImmediatePropagation: function() {
      		this.isImmediatePropagationStopped = returnTrue;
      		this.stopPropagation();
      	}
      };
      
      // Create mouseenter/leave events using mouseover/out and event-time checks
      // Support: Chrome 15+
      jQuery.each({
      	mouseenter: "mouseover",
      	mouseleave: "mouseout"
      }, function( orig, fix ) {
      	jQuery.event.special[ orig ] = {
      		delegateType: fix,
      		bindType: fix,
      
      		handle: function( event ) {
      			var ret,
      				target = this,
      				related = event.relatedTarget,
      				handleObj = event.handleObj;
      
      			// For mousenter/leave call the handler if related is outside the target.
      			// NB: No relatedTarget if the mouse left/entered the browser window
      			if ( !related || (related !== target && !jQuery.contains( target, related )) ) {
      				event.type = handleObj.origType;
      				ret = handleObj.handler.apply( this, arguments );
      				event.type = fix;
      			}
      			return ret;
      		}
      	};
      });
      
      // Create "bubbling" focus and blur events
      // Support: Firefox, Chrome, Safari
      if ( !jQuery.support.focusinBubbles ) {
      	jQuery.each({ focus: "focusin", blur: "focusout" }, function( orig, fix ) {
      
      		// Attach a single capturing handler while someone wants focusin/focusout
      		var attaches = 0,
      			handler = function( event ) {
      				jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ), true );
      			};
      
      		jQuery.event.special[ fix ] = {
      			setup: function() {
      				if ( attaches++ === 0 ) {
      					document.addEventListener( orig, handler, true );
      				}
      			},
      			teardown: function() {
      				if ( --attaches === 0 ) {
      					document.removeEventListener( orig, handler, true );
      				}
      			}
      		};
      	});
      }
      
      jQuery.fn.extend({
      
      	on: function( types, selector, data, fn, /*INTERNAL*/ one ) {
      		var origFn, type;
      
      		// Types can be a map of types/handlers
      		if ( typeof types === "object" ) {
      			// ( types-Object, selector, data )
      			if ( typeof selector !== "string" ) {
      				// ( types-Object, data )
      				data = data || selector;
      				selector = undefined;
      			}
      			for ( type in types ) {
      				this.on( type, selector, data, types[ type ], one );
      			}
      			return this;
      		}
      
      		if ( data == null && fn == null ) {
      			// ( types, fn )
      			fn = selector;
      			data = selector = undefined;
      		} else if ( fn == null ) {
      			if ( typeof selector === "string" ) {
      				// ( types, selector, fn )
      				fn = data;
      				data = undefined;
      			} else {
      				// ( types, data, fn )
      				fn = data;
      				data = selector;
      				selector = undefined;
      			}
      		}
      		if ( fn === false ) {
      			fn = returnFalse;
      		} else if ( !fn ) {
      			return this;
      		}
      
      		if ( one === 1 ) {
      			origFn = fn;
      			fn = function( event ) {
      				// Can use an empty set, since event contains the info
      				jQuery().off( event );
      				return origFn.apply( this, arguments );
      			};
      			// Use same guid so caller can remove using origFn
      			fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
      		}
      		return this.each( function() {
      			jQuery.event.add( this, types, fn, data, selector );
      		});
      	},
      	one: function( types, selector, data, fn ) {
      		return this.on( types, selector, data, fn, 1 );
      	},
      	off: function( types, selector, fn ) {
      		var handleObj, type;
      		if ( types && types.preventDefault && types.handleObj ) {
      			// ( event )  dispatched jQuery.Event
      			handleObj = types.handleObj;
      			jQuery( types.delegateTarget ).off(
      				handleObj.namespace ? handleObj.origType + "." + handleObj.namespace : handleObj.origType,
      				handleObj.selector,
      				handleObj.handler
      			);
      			return this;
      		}
      		if ( typeof types === "object" ) {
      			// ( types-object [, selector] )
      			for ( type in types ) {
      				this.off( type, selector, types[ type ] );
      			}
      			return this;
      		}
      		if ( selector === false || typeof selector === "function" ) {
      			// ( types [, fn] )
      			fn = selector;
      			selector = undefined;
      		}
      		if ( fn === false ) {
      			fn = returnFalse;
      		}
      		return this.each(function() {
      			jQuery.event.remove( this, types, fn, selector );
      		});
      	},
      
      	trigger: function( type, data ) {
      		return this.each(function() {
      			jQuery.event.trigger( type, data, this );
      		});
      	},
      	triggerHandler: function( type, data ) {
      		var elem = this[0];
      		if ( elem ) {
      			return jQuery.event.trigger( type, data, elem, true );
      		}
      	}
      });
      var isSimple = /^.[^:#\[\.,]*$/,
      	rparentsprev = /^(?:parents|prev(?:Until|All))/,
      	rneedsContext = jQuery.expr.match.needsContext,
      	// methods guaranteed to produce a unique set when starting from a unique set
      	guaranteedUnique = {
      		children: true,
      		contents: true,
      		next: true,
      		prev: true
      	};
      
      jQuery.fn.extend({
      	find: function( selector ) {
      		var i,
      			ret = [],
      			self = this,
      			len = self.length;
      
      		if ( typeof selector !== "string" ) {
      			return this.pushStack( jQuery( selector ).filter(function() {
      				for ( i = 0; i < len; i++ ) {
      					if ( jQuery.contains( self[ i ], this ) ) {
      						return true;
      					}
      				}
      			}) );
      		}
      
      		for ( i = 0; i < len; i++ ) {
      			jQuery.find( selector, self[ i ], ret );
      		}
      
      		// Needed because $( selector, context ) becomes $( context ).find( selector )
      		ret = this.pushStack( len > 1 ? jQuery.unique( ret ) : ret );
      		ret.selector = this.selector ? this.selector + " " + selector : selector;
      		return ret;
      	},
      
      	has: function( target ) {
      		var targets = jQuery( target, this ),
      			l = targets.length;
      
      		return this.filter(function() {
      			var i = 0;
      			for ( ; i < l; i++ ) {
      				if ( jQuery.contains( this, targets[i] ) ) {
      					return true;
      				}
      			}
      		});
      	},
      
      	not: function( selector ) {
      		return this.pushStack( winnow(this, selector || [], true) );
      	},
      
      	filter: function( selector ) {
      		return this.pushStack( winnow(this, selector || [], false) );
      	},
      
      	is: function( selector ) {
      		return !!winnow(
      			this,
      
      			// If this is a positional/relative selector, check membership in the returned set
      			// so $("p:first").is("p:last") won't return true for a doc with two "p".
      			typeof selector === "string" && rneedsContext.test( selector ) ?
      				jQuery( selector ) :
      				selector || [],
      			false
      		).length;
      	},
      
      	closest: function( selectors, context ) {
      		var cur,
      			i = 0,
      			l = this.length,
      			matched = [],
      			pos = ( rneedsContext.test( selectors ) || typeof selectors !== "string" ) ?
      				jQuery( selectors, context || this.context ) :
      				0;
      
      		for ( ; i < l; i++ ) {
      			for ( cur = this[i]; cur && cur !== context; cur = cur.parentNode ) {
      				// Always skip document fragments
      				if ( cur.nodeType < 11 && (pos ?
      					pos.index(cur) > -1 :
      
      					// Don't pass non-elements to Sizzle
      					cur.nodeType === 1 &&
      						jQuery.find.matchesSelector(cur, selectors)) ) {
      
      					cur = matched.push( cur );
      					break;
      				}
      			}
      		}
      
      		return this.pushStack( matched.length > 1 ? jQuery.unique( matched ) : matched );
      	},
      
      	// Determine the position of an element within
      	// the matched set of elements
      	index: function( elem ) {
      
      		// No argument, return index in parent
      		if ( !elem ) {
      			return ( this[ 0 ] && this[ 0 ].parentNode ) ? this.first().prevAll().length : -1;
      		}
      
      		// index in selector
      		if ( typeof elem === "string" ) {
      			return core_indexOf.call( jQuery( elem ), this[ 0 ] );
      		}
      
      		// Locate the position of the desired element
      		return core_indexOf.call( this,
      
      			// If it receives a jQuery object, the first element is used
      			elem.jquery ? elem[ 0 ] : elem
      		);
      	},
      
      	add: function( selector, context ) {
      		var set = typeof selector === "string" ?
      				jQuery( selector, context ) :
      				jQuery.makeArray( selector && selector.nodeType ? [ selector ] : selector ),
      			all = jQuery.merge( this.get(), set );
      
      		return this.pushStack( jQuery.unique(all) );
      	},
      
      	addBack: function( selector ) {
      		return this.add( selector == null ?
      			this.prevObject : this.prevObject.filter(selector)
      		);
      	}
      });
      
      function sibling( cur, dir ) {
      	while ( (cur = cur[dir]) && cur.nodeType !== 1 ) {}
      
      	return cur;
      }
      
      jQuery.each({
      	parent: function( elem ) {
      		var parent = elem.parentNode;
      		return parent && parent.nodeType !== 11 ? parent : null;
      	},
      	parents: function( elem ) {
      		return jQuery.dir( elem, "parentNode" );
      	},
      	parentsUntil: function( elem, i, until ) {
      		return jQuery.dir( elem, "parentNode", until );
      	},
      	next: function( elem ) {
      		return sibling( elem, "nextSibling" );
      	},
      	prev: function( elem ) {
      		return sibling( elem, "previousSibling" );
      	},
      	nextAll: function( elem ) {
      		return jQuery.dir( elem, "nextSibling" );
      	},
      	prevAll: function( elem ) {
      		return jQuery.dir( elem, "previousSibling" );
      	},
      	nextUntil: function( elem, i, until ) {
      		return jQuery.dir( elem, "nextSibling", until );
      	},
      	prevUntil: function( elem, i, until ) {
      		return jQuery.dir( elem, "previousSibling", until );
      	},
      	siblings: function( elem ) {
      		return jQuery.sibling( ( elem.parentNode || {} ).firstChild, elem );
      	},
      	children: function( elem ) {
      		return jQuery.sibling( elem.firstChild );
      	},
      	contents: function( elem ) {
      		return elem.contentDocument || jQuery.merge( [], elem.childNodes );
      	}
      }, function( name, fn ) {
      	jQuery.fn[ name ] = function( until, selector ) {
      		var matched = jQuery.map( this, fn, until );
      
      		if ( name.slice( -5 ) !== "Until" ) {
      			selector = until;
      		}
      
      		if ( selector && typeof selector === "string" ) {
      			matched = jQuery.filter( selector, matched );
      		}
      
      		if ( this.length > 1 ) {
      			// Remove duplicates
      			if ( !guaranteedUnique[ name ] ) {
      				jQuery.unique( matched );
      			}
      
      			// Reverse order for parents* and prev-derivatives
      			if ( rparentsprev.test( name ) ) {
      				matched.reverse();
      			}
      		}
      
      		return this.pushStack( matched );
      	};
      });
      
      jQuery.extend({
      	filter: function( expr, elems, not ) {
      		var elem = elems[ 0 ];
      
      		if ( not ) {
      			expr = ":not(" + expr + ")";
      		}
      
      		return elems.length === 1 && elem.nodeType === 1 ?
      			jQuery.find.matchesSelector( elem, expr ) ? [ elem ] : [] :
      			jQuery.find.matches( expr, jQuery.grep( elems, function( elem ) {
      				return elem.nodeType === 1;
      			}));
      	},
      
      	dir: function( elem, dir, until ) {
      		var matched = [],
      			truncate = until !== undefined;
      
      		while ( (elem = elem[ dir ]) && elem.nodeType !== 9 ) {
      			if ( elem.nodeType === 1 ) {
      				if ( truncate && jQuery( elem ).is( until ) ) {
      					break;
      				}
      				matched.push( elem );
      			}
      		}
      		return matched;
      	},
      
      	sibling: function( n, elem ) {
      		var matched = [];
      
      		for ( ; n; n = n.nextSibling ) {
      			if ( n.nodeType === 1 && n !== elem ) {
      				matched.push( n );
      			}
      		}
      
      		return matched;
      	}
      });
      
      // Implement the identical functionality for filter and not
      function winnow( elements, qualifier, not ) {
      	if ( jQuery.isFunction( qualifier ) ) {
      		return jQuery.grep( elements, function( elem, i ) {
      			/* jshint -W018 */
      			return !!qualifier.call( elem, i, elem ) !== not;
      		});
      
      	}
      
      	if ( qualifier.nodeType ) {
      		return jQuery.grep( elements, function( elem ) {
      			return ( elem === qualifier ) !== not;
      		});
      
      	}
      
      	if ( typeof qualifier === "string" ) {
      		if ( isSimple.test( qualifier ) ) {
      			return jQuery.filter( qualifier, elements, not );
      		}
      
      		qualifier = jQuery.filter( qualifier, elements );
      	}
      
      	return jQuery.grep( elements, function( elem ) {
      		return ( core_indexOf.call( qualifier, elem ) >= 0 ) !== not;
      	});
      }
      var rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
      	rtagName = /<([\w:]+)/,
      	rhtml = /<|&#?\w+;/,
      	rnoInnerhtml = /<(?:script|style|link)/i,
      	manipulation_rcheckableType = /^(?:checkbox|radio)$/i,
      	// checked="checked" or checked
      	rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
      	rscriptType = /^$|\/(?:java|ecma)script/i,
      	rscriptTypeMasked = /^true\/(.*)/,
      	rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,
      
      	// We have to close these tags to support XHTML (#13200)
      	wrapMap = {
      
      		// Support: IE 9
      		option: [ 1, "<select multiple='multiple'>", "</select>" ],
      
      		thead: [ 1, "<table>", "</table>" ],
      		col: [ 2, "<table><colgroup>", "</colgroup></table>" ],
      		tr: [ 2, "<table><tbody>", "</tbody></table>" ],
      		td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],
      
      		_default: [ 0, "", "" ]
      	};
      
      // Support: IE 9
      wrapMap.optgroup = wrapMap.option;
      
      wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
      wrapMap.th = wrapMap.td;
      
      jQuery.fn.extend({
      	text: function( value ) {
      		return jQuery.access( this, function( value ) {
      			return value === undefined ?
      				jQuery.text( this ) :
      				this.empty().append( ( this[ 0 ] && this[ 0 ].ownerDocument || document ).createTextNode( value ) );
      		}, null, value, arguments.length );
      	},
      
      	append: function() {
      		return this.domManip( arguments, function( elem ) {
      			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
      				var target = manipulationTarget( this, elem );
      				target.appendChild( elem );
      			}
      		});
      	},
      
      	prepend: function() {
      		return this.domManip( arguments, function( elem ) {
      			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
      				var target = manipulationTarget( this, elem );
      				target.insertBefore( elem, target.firstChild );
      			}
      		});
      	},
      
      	before: function() {
      		return this.domManip( arguments, function( elem ) {
      			if ( this.parentNode ) {
      				this.parentNode.insertBefore( elem, this );
      			}
      		});
      	},
      
      	after: function() {
      		return this.domManip( arguments, function( elem ) {
      			if ( this.parentNode ) {
      				this.parentNode.insertBefore( elem, this.nextSibling );
      			}
      		});
      	},
      
      	// keepData is for internal use only--do not document
      	remove: function( selector, keepData ) {
      		var elem,
      			elems = selector ? jQuery.filter( selector, this ) : this,
      			i = 0;
      
      		for ( ; (elem = elems[i]) != null; i++ ) {
      			if ( !keepData && elem.nodeType === 1 ) {
      				jQuery.cleanData( getAll( elem ) );
      			}
      
      			if ( elem.parentNode ) {
      				if ( keepData && jQuery.contains( elem.ownerDocument, elem ) ) {
      					setGlobalEval( getAll( elem, "script" ) );
      				}
      				elem.parentNode.removeChild( elem );
      			}
      		}
      
      		return this;
      	},
      
      	empty: function() {
      		var elem,
      			i = 0;
      
      		for ( ; (elem = this[i]) != null; i++ ) {
      			if ( elem.nodeType === 1 ) {
      
      				// Prevent memory leaks
      				jQuery.cleanData( getAll( elem, false ) );
      
      				// Remove any remaining nodes
      				elem.textContent = "";
      			}
      		}
      
      		return this;
      	},
      
      	clone: function( dataAndEvents, deepDataAndEvents ) {
      		dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
      		deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;
      
      		return this.map( function () {
      			return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
      		});
      	},
      
      	html: function( value ) {
      		return jQuery.access( this, function( value ) {
      			var elem = this[ 0 ] || {},
      				i = 0,
      				l = this.length;
      
      			if ( value === undefined && elem.nodeType === 1 ) {
      				return elem.innerHTML;
      			}
      
      			// See if we can take a shortcut and just use innerHTML
      			if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
      				!wrapMap[ ( rtagName.exec( value ) || [ "", "" ] )[ 1 ].toLowerCase() ] ) {
      
      				value = value.replace( rxhtmlTag, "<$1></$2>" );
      
      				try {
      					for ( ; i < l; i++ ) {
      						elem = this[ i ] || {};
      
      						// Remove element nodes and prevent memory leaks
      						if ( elem.nodeType === 1 ) {
      							jQuery.cleanData( getAll( elem, false ) );
      							elem.innerHTML = value;
      						}
      					}
      
      					elem = 0;
      
      				// If using innerHTML throws an exception, use the fallback method
      				} catch( e ) {}
      			}
      
      			if ( elem ) {
      				this.empty().append( value );
      			}
      		}, null, value, arguments.length );
      	},
      
      	replaceWith: function() {
      		var
      			// Snapshot the DOM in case .domManip sweeps something relevant into its fragment
      			args = jQuery.map( this, function( elem ) {
      				return [ elem.nextSibling, elem.parentNode ];
      			}),
      			i = 0;
      
      		// Make the changes, replacing each context element with the new content
      		this.domManip( arguments, function( elem ) {
      			var next = args[ i++ ],
      				parent = args[ i++ ];
      
      			if ( parent ) {
      				// Don't use the snapshot next if it has moved (#13810)
      				if ( next && next.parentNode !== parent ) {
      					next = this.nextSibling;
      				}
      				jQuery( this ).remove();
      				parent.insertBefore( elem, next );
      			}
      		// Allow new content to include elements from the context set
      		}, true );
      
      		// Force removal if there was no new content (e.g., from empty arguments)
      		return i ? this : this.remove();
      	},
      
      	detach: function( selector ) {
      		return this.remove( selector, true );
      	},
      
      	domManip: function( args, callback, allowIntersection ) {
      
      		// Flatten any nested arrays
      		args = core_concat.apply( [], args );
      
      		var fragment, first, scripts, hasScripts, node, doc,
      			i = 0,
      			l = this.length,
      			set = this,
      			iNoClone = l - 1,
      			value = args[ 0 ],
      			isFunction = jQuery.isFunction( value );
      
      		// We can't cloneNode fragments that contain checked, in WebKit
      		if ( isFunction || !( l <= 1 || typeof value !== "string" || jQuery.support.checkClone || !rchecked.test( value ) ) ) {
      			return this.each(function( index ) {
      				var self = set.eq( index );
      				if ( isFunction ) {
      					args[ 0 ] = value.call( this, index, self.html() );
      				}
      				self.domManip( args, callback, allowIntersection );
      			});
      		}
      
      		if ( l ) {
      			fragment = jQuery.buildFragment( args, this[ 0 ].ownerDocument, false, !allowIntersection && this );
      			first = fragment.firstChild;
      
      			if ( fragment.childNodes.length === 1 ) {
      				fragment = first;
      			}
      
      			if ( first ) {
      				scripts = jQuery.map( getAll( fragment, "script" ), disableScript );
      				hasScripts = scripts.length;
      
      				// Use the original fragment for the last item instead of the first because it can end up
      				// being emptied incorrectly in certain situations (#8070).
      				for ( ; i < l; i++ ) {
      					node = fragment;
      
      					if ( i !== iNoClone ) {
      						node = jQuery.clone( node, true, true );
      
      						// Keep references to cloned scripts for later restoration
      						if ( hasScripts ) {
      							// Support: QtWebKit
      							// jQuery.merge because core_push.apply(_, arraylike) throws
      							jQuery.merge( scripts, getAll( node, "script" ) );
      						}
      					}
      
      					callback.call( this[ i ], node, i );
      				}
      
      				if ( hasScripts ) {
      					doc = scripts[ scripts.length - 1 ].ownerDocument;
      
      					// Reenable scripts
      					jQuery.map( scripts, restoreScript );
      
      					// Evaluate executable scripts on first document insertion
      					for ( i = 0; i < hasScripts; i++ ) {
      						node = scripts[ i ];
      						if ( rscriptType.test( node.type || "" ) &&
      							!data_priv.access( node, "globalEval" ) && jQuery.contains( doc, node ) ) {
      
      							if ( node.src ) {
      								// Hope ajax is available...
      								jQuery._evalUrl( node.src );
      							} else {
      								jQuery.globalEval( node.textContent.replace( rcleanScript, "" ) );
      							}
      						}
      					}
      				}
      			}
      		}
      
      		return this;
      	}
      });
      
      jQuery.each({
      	appendTo: "append",
      	prependTo: "prepend",
      	insertBefore: "before",
      	insertAfter: "after",
      	replaceAll: "replaceWith"
      }, function( name, original ) {
      	jQuery.fn[ name ] = function( selector ) {
      		var elems,
      			ret = [],
      			insert = jQuery( selector ),
      			last = insert.length - 1,
      			i = 0;
      
      		for ( ; i <= last; i++ ) {
      			elems = i === last ? this : this.clone( true );
      			jQuery( insert[ i ] )[ original ]( elems );
      
      			// Support: QtWebKit
      			// .get() because core_push.apply(_, arraylike) throws
      			core_push.apply( ret, elems.get() );
      		}
      
      		return this.pushStack( ret );
      	};
      });
      
      jQuery.extend({
      	clone: function( elem, dataAndEvents, deepDataAndEvents ) {
      		var i, l, srcElements, destElements,
      			clone = elem.cloneNode( true ),
      			inPage = jQuery.contains( elem.ownerDocument, elem );
      
      		// Support: IE >= 9
      		// Fix Cloning issues
      		if ( !jQuery.support.noCloneChecked && ( elem.nodeType === 1 || elem.nodeType === 11 ) && !jQuery.isXMLDoc( elem ) ) {
      
      			// We eschew Sizzle here for performance reasons: http://jsperf.com/getall-vs-sizzle/2
      			destElements = getAll( clone );
      			srcElements = getAll( elem );
      
      			for ( i = 0, l = srcElements.length; i < l; i++ ) {
      				fixInput( srcElements[ i ], destElements[ i ] );
      			}
      		}
      
      		// Copy the events from the original to the clone
      		if ( dataAndEvents ) {
      			if ( deepDataAndEvents ) {
      				srcElements = srcElements || getAll( elem );
      				destElements = destElements || getAll( clone );
      
      				for ( i = 0, l = srcElements.length; i < l; i++ ) {
      					cloneCopyEvent( srcElements[ i ], destElements[ i ] );
      				}
      			} else {
      				cloneCopyEvent( elem, clone );
      			}
      		}
      
      		// Preserve script evaluation history
      		destElements = getAll( clone, "script" );
      		if ( destElements.length > 0 ) {
      			setGlobalEval( destElements, !inPage && getAll( elem, "script" ) );
      		}
      
      		// Return the cloned set
      		return clone;
      	},
      
      	buildFragment: function( elems, context, scripts, selection ) {
      		var elem, tmp, tag, wrap, contains, j,
      			i = 0,
      			l = elems.length,
      			fragment = context.createDocumentFragment(),
      			nodes = [];
      
      		for ( ; i < l; i++ ) {
      			elem = elems[ i ];
      
      			if ( elem || elem === 0 ) {
      
      				// Add nodes directly
      				if ( jQuery.type( elem ) === "object" ) {
      					// Support: QtWebKit
      					// jQuery.merge because core_push.apply(_, arraylike) throws
      					jQuery.merge( nodes, elem.nodeType ? [ elem ] : elem );
      
      				// Convert non-html into a text node
      				} else if ( !rhtml.test( elem ) ) {
      					nodes.push( context.createTextNode( elem ) );
      
      				// Convert html into DOM nodes
      				} else {
      					tmp = tmp || fragment.appendChild( context.createElement("div") );
      
      					// Deserialize a standard representation
      					tag = ( rtagName.exec( elem ) || ["", ""] )[ 1 ].toLowerCase();
      					wrap = wrapMap[ tag ] || wrapMap._default;
      					tmp.innerHTML = wrap[ 1 ] + elem.replace( rxhtmlTag, "<$1></$2>" ) + wrap[ 2 ];
      
      					// Descend through wrappers to the right content
      					j = wrap[ 0 ];
      					while ( j-- ) {
      						tmp = tmp.lastChild;
      					}
      
      					// Support: QtWebKit
      					// jQuery.merge because core_push.apply(_, arraylike) throws
      					jQuery.merge( nodes, tmp.childNodes );
      
      					// Remember the top-level container
      					tmp = fragment.firstChild;
      
      					// Fixes #12346
      					// Support: Webkit, IE
      					tmp.textContent = "";
      				}
      			}
      		}
      
      		// Remove wrapper from fragment
      		fragment.textContent = "";
      
      		i = 0;
      		while ( (elem = nodes[ i++ ]) ) {
      
      			// #4087 - If origin and destination elements are the same, and this is
      			// that element, do not do anything
      			if ( selection && jQuery.inArray( elem, selection ) !== -1 ) {
      				continue;
      			}
      
      			contains = jQuery.contains( elem.ownerDocument, elem );
      
      			// Append to fragment
      			tmp = getAll( fragment.appendChild( elem ), "script" );
      
      			// Preserve script evaluation history
      			if ( contains ) {
      				setGlobalEval( tmp );
      			}
      
      			// Capture executables
      			if ( scripts ) {
      				j = 0;
      				while ( (elem = tmp[ j++ ]) ) {
      					if ( rscriptType.test( elem.type || "" ) ) {
      						scripts.push( elem );
      					}
      				}
      			}
      		}
      
      		return fragment;
      	},
      
      	cleanData: function( elems ) {
      		var data, elem, events, type, key, j,
      			special = jQuery.event.special,
      			i = 0;
      
      		for ( ; (elem = elems[ i ]) !== undefined; i++ ) {
      			if ( Data.accepts( elem ) ) {
      				key = elem[ data_priv.expando ];
      
      				if ( key && (data = data_priv.cache[ key ]) ) {
      					events = Object.keys( data.events || {} );
      					if ( events.length ) {
      						for ( j = 0; (type = events[j]) !== undefined; j++ ) {
      							if ( special[ type ] ) {
      								jQuery.event.remove( elem, type );
      
      							// This is a shortcut to avoid jQuery.event.remove's overhead
      							} else {
      								jQuery.removeEvent( elem, type, data.handle );
      							}
      						}
      					}
      					if ( data_priv.cache[ key ] ) {
      						// Discard any remaining `private` data
      						delete data_priv.cache[ key ];
      					}
      				}
      			}
      			// Discard any remaining `user` data
      			delete data_user.cache[ elem[ data_user.expando ] ];
      		}
      	},
      
      	_evalUrl: function( url ) {
      		return jQuery.ajax({
      			url: url,
      			type: "GET",
      			dataType: "script",
      			async: false,
      			global: false,
      			"throws": true
      		});
      	}
      });
      
      // Support: 1.x compatibility
      // Manipulating tables requires a tbody
      function manipulationTarget( elem, content ) {
      	return jQuery.nodeName( elem, "table" ) &&
      		jQuery.nodeName( content.nodeType === 1 ? content : content.firstChild, "tr" ) ?
      
      		elem.getElementsByTagName("tbody")[0] ||
      			elem.appendChild( elem.ownerDocument.createElement("tbody") ) :
      		elem;
      }
      
      // Replace/restore the type attribute of script elements for safe DOM manipulation
      function disableScript( elem ) {
      	elem.type = (elem.getAttribute("type") !== null) + "/" + elem.type;
      	return elem;
      }
      function restoreScript( elem ) {
      	var match = rscriptTypeMasked.exec( elem.type );
      
      	if ( match ) {
      		elem.type = match[ 1 ];
      	} else {
      		elem.removeAttribute("type");
      	}
      
      	return elem;
      }
      
      // Mark scripts as having already been evaluated
      function setGlobalEval( elems, refElements ) {
      	var l = elems.length,
      		i = 0;
      
      	for ( ; i < l; i++ ) {
      		data_priv.set(
      			elems[ i ], "globalEval", !refElements || data_priv.get( refElements[ i ], "globalEval" )
      		);
      	}
      }
      
      function cloneCopyEvent( src, dest ) {
      	var i, l, type, pdataOld, pdataCur, udataOld, udataCur, events;
      
      	if ( dest.nodeType !== 1 ) {
      		return;
      	}
      
      	// 1. Copy private data: events, handlers, etc.
      	if ( data_priv.hasData( src ) ) {
      		pdataOld = data_priv.access( src );
      		pdataCur = data_priv.set( dest, pdataOld );
      		events = pdataOld.events;
      
      		if ( events ) {
      			delete pdataCur.handle;
      			pdataCur.events = {};
      
      			for ( type in events ) {
      				for ( i = 0, l = events[ type ].length; i < l; i++ ) {
      					jQuery.event.add( dest, type, events[ type ][ i ] );
      				}
      			}
      		}
      	}
      
      	// 2. Copy user data
      	if ( data_user.hasData( src ) ) {
      		udataOld = data_user.access( src );
      		udataCur = jQuery.extend( {}, udataOld );
      
      		data_user.set( dest, udataCur );
      	}
      }
      
      
      function getAll( context, tag ) {
      	var ret = context.getElementsByTagName ? context.getElementsByTagName( tag || "*" ) :
      			context.querySelectorAll ? context.querySelectorAll( tag || "*" ) :
      			[];
      
      	return tag === undefined || tag && jQuery.nodeName( context, tag ) ?
      		jQuery.merge( [ context ], ret ) :
      		ret;
      }
      
      // Support: IE >= 9
      function fixInput( src, dest ) {
      	var nodeName = dest.nodeName.toLowerCase();
      
      	// Fails to persist the checked state of a cloned checkbox or radio button.
      	if ( nodeName === "input" && manipulation_rcheckableType.test( src.type ) ) {
      		dest.checked = src.checked;
      
      	// Fails to return the selected option to the default selected state when cloning options
      	} else if ( nodeName === "input" || nodeName === "textarea" ) {
      		dest.defaultValue = src.defaultValue;
      	}
      }
      jQuery.fn.extend({
      	wrapAll: function( html ) {
      		var wrap;
      
      		if ( jQuery.isFunction( html ) ) {
      			return this.each(function( i ) {
      				jQuery( this ).wrapAll( html.call(this, i) );
      			});
      		}
      
      		if ( this[ 0 ] ) {
      
      			// The elements to wrap the target around
      			wrap = jQuery( html, this[ 0 ].ownerDocument ).eq( 0 ).clone( true );
      
      			if ( this[ 0 ].parentNode ) {
      				wrap.insertBefore( this[ 0 ] );
      			}
      
      			wrap.map(function() {
      				var elem = this;
      
      				while ( elem.firstElementChild ) {
      					elem = elem.firstElementChild;
      				}
      
      				return elem;
      			}).append( this );
      		}
      
      		return this;
      	},
      
      	wrapInner: function( html ) {
      		if ( jQuery.isFunction( html ) ) {
      			return this.each(function( i ) {
      				jQuery( this ).wrapInner( html.call(this, i) );
      			});
      		}
      
      		return this.each(function() {
      			var self = jQuery( this ),
      				contents = self.contents();
      
      			if ( contents.length ) {
      				contents.wrapAll( html );
      
      			} else {
      				self.append( html );
      			}
      		});
      	},
      
      	wrap: function( html ) {
      		var isFunction = jQuery.isFunction( html );
      
      		return this.each(function( i ) {
      			jQuery( this ).wrapAll( isFunction ? html.call(this, i) : html );
      		});
      	},
      
      	unwrap: function() {
      		return this.parent().each(function() {
      			if ( !jQuery.nodeName( this, "body" ) ) {
      				jQuery( this ).replaceWith( this.childNodes );
      			}
      		}).end();
      	}
      });
      var curCSS, iframe,
      	// swappable if display is none or starts with table except "table", "table-cell", or "table-caption"
      	// see here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
      	rdisplayswap = /^(none|table(?!-c[ea]).+)/,
      	rmargin = /^margin/,
      	rnumsplit = new RegExp( "^(" + core_pnum + ")(.*)$", "i" ),
      	rnumnonpx = new RegExp( "^(" + core_pnum + ")(?!px)[a-z%]+$", "i" ),
      	rrelNum = new RegExp( "^([+-])=(" + core_pnum + ")", "i" ),
      	elemdisplay = { BODY: "block" },
      
      	cssShow = { position: "absolute", visibility: "hidden", display: "block" },
      	cssNormalTransform = {
      		letterSpacing: 0,
      		fontWeight: 400
      	},
      
      	cssExpand = [ "Top", "Right", "Bottom", "Left" ],
      	cssPrefixes = [ "Webkit", "O", "Moz", "ms" ];
      
      // return a css property mapped to a potentially vendor prefixed property
      function vendorPropName( style, name ) {
      
      	// shortcut for names that are not vendor prefixed
      	if ( name in style ) {
      		return name;
      	}
      
      	// check for vendor prefixed names
      	var capName = name.charAt(0).toUpperCase() + name.slice(1),
      		origName = name,
      		i = cssPrefixes.length;
      
      	while ( i-- ) {
      		name = cssPrefixes[ i ] + capName;
      		if ( name in style ) {
      			return name;
      		}
      	}
      
      	return origName;
      }
      
      function isHidden( elem, el ) {
      	// isHidden might be called from jQuery#filter function;
      	// in that case, element will be second argument
      	elem = el || elem;
      	return jQuery.css( elem, "display" ) === "none" || !jQuery.contains( elem.ownerDocument, elem );
      }
      
      // NOTE: we've included the "window" in window.getComputedStyle
      // because jsdom on node.js will break without it.
      function getStyles( elem ) {
      	return window.getComputedStyle( elem, null );
      }
      
      function showHide( elements, show ) {
      	var display, elem, hidden,
      		values = [],
      		index = 0,
      		length = elements.length;
      
      	for ( ; index < length; index++ ) {
      		elem = elements[ index ];
      		if ( !elem.style ) {
      			continue;
      		}
      
      		values[ index ] = data_priv.get( elem, "olddisplay" );
      		display = elem.style.display;
      		if ( show ) {
      			// Reset the inline display of this element to learn if it is
      			// being hidden by cascaded rules or not
      			if ( !values[ index ] && display === "none" ) {
      				elem.style.display = "";
      			}
      
      			// Set elements which have been overridden with display: none
      			// in a stylesheet to whatever the default browser style is
      			// for such an element
      			if ( elem.style.display === "" && isHidden( elem ) ) {
      				values[ index ] = data_priv.access( elem, "olddisplay", css_defaultDisplay(elem.nodeName) );
      			}
      		} else {
      
      			if ( !values[ index ] ) {
      				hidden = isHidden( elem );
      
      				if ( display && display !== "none" || !hidden ) {
      					data_priv.set( elem, "olddisplay", hidden ? display : jQuery.css(elem, "display") );
      				}
      			}
      		}
      	}
      
      	// Set the display of most of the elements in a second loop
      	// to avoid the constant reflow
      	for ( index = 0; index < length; index++ ) {
      		elem = elements[ index ];
      		if ( !elem.style ) {
      			continue;
      		}
      		if ( !show || elem.style.display === "none" || elem.style.display === "" ) {
      			elem.style.display = show ? values[ index ] || "" : "none";
      		}
      	}
      
      	return elements;
      }
      
      jQuery.fn.extend({
      	css: function( name, value ) {
      		return jQuery.access( this, function( elem, name, value ) {
      			var styles, len,
      				map = {},
      				i = 0;
      
      			if ( jQuery.isArray( name ) ) {
      				styles = getStyles( elem );
      				len = name.length;
      
      				for ( ; i < len; i++ ) {
      					map[ name[ i ] ] = jQuery.css( elem, name[ i ], false, styles );
      				}
      
      				return map;
      			}
      
      			return value !== undefined ?
      				jQuery.style( elem, name, value ) :
      				jQuery.css( elem, name );
      		}, name, value, arguments.length > 1 );
      	},
      	show: function() {
      		return showHide( this, true );
      	},
      	hide: function() {
      		return showHide( this );
      	},
      	toggle: function( state ) {
      		if ( typeof state === "boolean" ) {
      			return state ? this.show() : this.hide();
      		}
      
      		return this.each(function() {
      			if ( isHidden( this ) ) {
      				jQuery( this ).show();
      			} else {
      				jQuery( this ).hide();
      			}
      		});
      	}
      });
      
      jQuery.extend({
      	// Add in style property hooks for overriding the default
      	// behavior of getting and setting a style property
      	cssHooks: {
      		opacity: {
      			get: function( elem, computed ) {
      				if ( computed ) {
      					// We should always get a number back from opacity
      					var ret = curCSS( elem, "opacity" );
      					return ret === "" ? "1" : ret;
      				}
      			}
      		}
      	},
      
      	// Don't automatically add "px" to these possibly-unitless properties
      	cssNumber: {
      		"columnCount": true,
      		"fillOpacity": true,
      		"fontWeight": true,
      		"lineHeight": true,
      		"opacity": true,
      		"order": true,
      		"orphans": true,
      		"widows": true,
      		"zIndex": true,
      		"zoom": true
      	},
      
      	// Add in properties whose names you wish to fix before
      	// setting or getting the value
      	cssProps: {
      		// normalize float css property
      		"float": "cssFloat"
      	},
      
      	// Get and set the style property on a DOM Node
      	style: function( elem, name, value, extra ) {
      		// Don't set styles on text and comment nodes
      		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
      			return;
      		}
      
      		// Make sure that we're working with the right name
      		var ret, type, hooks,
      			origName = jQuery.camelCase( name ),
      			style = elem.style;
      
      		name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( style, origName ) );
      
      		// gets hook for the prefixed version
      		// followed by the unprefixed version
      		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];
      
      		// Check if we're setting a value
      		if ( value !== undefined ) {
      			type = typeof value;
      
      			// convert relative number strings (+= or -=) to relative numbers. #7345
      			if ( type === "string" && (ret = rrelNum.exec( value )) ) {
      				value = ( ret[1] + 1 ) * ret[2] + parseFloat( jQuery.css( elem, name ) );
      				// Fixes bug #9237
      				type = "number";
      			}
      
      			// Make sure that NaN and null values aren't set. See: #7116
      			if ( value == null || type === "number" && isNaN( value ) ) {
      				return;
      			}
      
      			// If a number was passed in, add 'px' to the (except for certain CSS properties)
      			if ( type === "number" && !jQuery.cssNumber[ origName ] ) {
      				value += "px";
      			}
      
      			// Fixes #8908, it can be done more correctly by specifying setters in cssHooks,
      			// but it would mean to define eight (for every problematic property) identical functions
      			if ( !jQuery.support.clearCloneStyle && value === "" && name.indexOf("background") === 0 ) {
      				style[ name ] = "inherit";
      			}
      
      			// If a hook was provided, use that value, otherwise just set the specified value
      			if ( !hooks || !("set" in hooks) || (value = hooks.set( elem, value, extra )) !== undefined ) {
      				style[ name ] = value;
      			}
      
      		} else {
      			// If a hook was provided get the non-computed value from there
      			if ( hooks && "get" in hooks && (ret = hooks.get( elem, false, extra )) !== undefined ) {
      				return ret;
      			}
      
      			// Otherwise just get the value from the style object
      			return style[ name ];
      		}
      	},
      
      	css: function( elem, name, extra, styles ) {
      		var val, num, hooks,
      			origName = jQuery.camelCase( name );
      
      		// Make sure that we're working with the right name
      		name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( elem.style, origName ) );
      
      		// gets hook for the prefixed version
      		// followed by the unprefixed version
      		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];
      
      		// If a hook was provided get the computed value from there
      		if ( hooks && "get" in hooks ) {
      			val = hooks.get( elem, true, extra );
      		}
      
      		// Otherwise, if a way to get the computed value exists, use that
      		if ( val === undefined ) {
      			val = curCSS( elem, name, styles );
      		}
      
      		//convert "normal" to computed value
      		if ( val === "normal" && name in cssNormalTransform ) {
      			val = cssNormalTransform[ name ];
      		}
      
      		// Return, converting to number if forced or a qualifier was provided and val looks numeric
      		if ( extra === "" || extra ) {
      			num = parseFloat( val );
      			return extra === true || jQuery.isNumeric( num ) ? num || 0 : val;
      		}
      		return val;
      	}
      });
      
      curCSS = function( elem, name, _computed ) {
      	var width, minWidth, maxWidth,
      		computed = _computed || getStyles( elem ),
      
      		// Support: IE9
      		// getPropertyValue is only needed for .css('filter') in IE9, see #12537
      		ret = computed ? computed.getPropertyValue( name ) || computed[ name ] : undefined,
      		style = elem.style;
      
      	if ( computed ) {
      
      		if ( ret === "" && !jQuery.contains( elem.ownerDocument, elem ) ) {
      			ret = jQuery.style( elem, name );
      		}
      
      		// Support: Safari 5.1
      		// A tribute to the "awesome hack by Dean Edwards"
      		// Safari 5.1.7 (at least) returns percentage for a larger set of values, but width seems to be reliably pixels
      		// this is against the CSSOM draft spec: http://dev.w3.org/csswg/cssom/#resolved-values
      		if ( rnumnonpx.test( ret ) && rmargin.test( name ) ) {
      
      			// Remember the original values
      			width = style.width;
      			minWidth = style.minWidth;
      			maxWidth = style.maxWidth;
      
      			// Put in the new values to get a computed value out
      			style.minWidth = style.maxWidth = style.width = ret;
      			ret = computed.width;
      
      			// Revert the changed values
      			style.width = width;
      			style.minWidth = minWidth;
      			style.maxWidth = maxWidth;
      		}
      	}
      
      	return ret;
      };
      
      
      function setPositiveNumber( elem, value, subtract ) {
      	var matches = rnumsplit.exec( value );
      	return matches ?
      		// Guard against undefined "subtract", e.g., when used as in cssHooks
      		Math.max( 0, matches[ 1 ] - ( subtract || 0 ) ) + ( matches[ 2 ] || "px" ) :
      		value;
      }
      
      function augmentWidthOrHeight( elem, name, extra, isBorderBox, styles ) {
      	var i = extra === ( isBorderBox ? "border" : "content" ) ?
      		// If we already have the right measurement, avoid augmentation
      		4 :
      		// Otherwise initialize for horizontal or vertical properties
      		name === "width" ? 1 : 0,
      
      		val = 0;
      
      	for ( ; i < 4; i += 2 ) {
      		// both box models exclude margin, so add it if we want it
      		if ( extra === "margin" ) {
      			val += jQuery.css( elem, extra + cssExpand[ i ], true, styles );
      		}
      
      		if ( isBorderBox ) {
      			// border-box includes padding, so remove it if we want content
      			if ( extra === "content" ) {
      				val -= jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
      			}
      
      			// at this point, extra isn't border nor margin, so remove border
      			if ( extra !== "margin" ) {
      				val -= jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
      			}
      		} else {
      			// at this point, extra isn't content, so add padding
      			val += jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
      
      			// at this point, extra isn't content nor padding, so add border
      			if ( extra !== "padding" ) {
      				val += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
      			}
      		}
      	}
      
      	return val;
      }
      
      function getWidthOrHeight( elem, name, extra ) {
      
      	// Start with offset property, which is equivalent to the border-box value
      	var valueIsBorderBox = true,
      		val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
      		styles = getStyles( elem ),
      		isBorderBox = jQuery.support.boxSizing && jQuery.css( elem, "boxSizing", false, styles ) === "border-box";
      
      	// some non-html elements return undefined for offsetWidth, so check for null/undefined
      	// svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
      	// MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
      	if ( val <= 0 || val == null ) {
      		// Fall back to computed then uncomputed css if necessary
      		val = curCSS( elem, name, styles );
      		if ( val < 0 || val == null ) {
      			val = elem.style[ name ];
      		}
      
      		// Computed unit is not pixels. Stop here and return.
      		if ( rnumnonpx.test(val) ) {
      			return val;
      		}
      
      		// we need the check for style in case a browser which returns unreliable values
      		// for getComputedStyle silently falls back to the reliable elem.style
      		valueIsBorderBox = isBorderBox && ( jQuery.support.boxSizingReliable || val === elem.style[ name ] );
      
      		// Normalize "", auto, and prepare for extra
      		val = parseFloat( val ) || 0;
      	}
      
      	// use the active box-sizing model to add/subtract irrelevant styles
      	return ( val +
      		augmentWidthOrHeight(
      			elem,
      			name,
      			extra || ( isBorderBox ? "border" : "content" ),
      			valueIsBorderBox,
      			styles
      		)
      	) + "px";
      }
      
      // Try to determine the default display value of an element
      function css_defaultDisplay( nodeName ) {
      	var doc = document,
      		display = elemdisplay[ nodeName ];
      
      	if ( !display ) {
      		display = actualDisplay( nodeName, doc );
      
      		// If the simple way fails, read from inside an iframe
      		if ( display === "none" || !display ) {
      			// Use the already-created iframe if possible
      			iframe = ( iframe ||
      				jQuery("<iframe frameborder='0' width='0' height='0'/>")
      				.css( "cssText", "display:block !important" )
      			).appendTo( doc.documentElement );
      
      			// Always write a new HTML skeleton so Webkit and Firefox don't choke on reuse
      			doc = ( iframe[0].contentWindow || iframe[0].contentDocument ).document;
      			doc.write("<!doctype html><html><body>");
      			doc.close();
      
      			display = actualDisplay( nodeName, doc );
      			iframe.detach();
      		}
      
      		// Store the correct default display
      		elemdisplay[ nodeName ] = display;
      	}
      
      	return display;
      }
      
      // Called ONLY from within css_defaultDisplay
      function actualDisplay( name, doc ) {
      	var elem = jQuery( doc.createElement( name ) ).appendTo( doc.body ),
      		display = jQuery.css( elem[0], "display" );
      	elem.remove();
      	return display;
      }
      
      jQuery.each([ "height", "width" ], function( i, name ) {
      	jQuery.cssHooks[ name ] = {
      		get: function( elem, computed, extra ) {
      			if ( computed ) {
      				// certain elements can have dimension info if we invisibly show them
      				// however, it must have a current display style that would benefit from this
      				return elem.offsetWidth === 0 && rdisplayswap.test( jQuery.css( elem, "display" ) ) ?
      					jQuery.swap( elem, cssShow, function() {
      						return getWidthOrHeight( elem, name, extra );
      					}) :
      					getWidthOrHeight( elem, name, extra );
      			}
      		},
      
      		set: function( elem, value, extra ) {
      			var styles = extra && getStyles( elem );
      			return setPositiveNumber( elem, value, extra ?
      				augmentWidthOrHeight(
      					elem,
      					name,
      					extra,
      					jQuery.support.boxSizing && jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
      					styles
      				) : 0
      			);
      		}
      	};
      });
      
      // These hooks cannot be added until DOM ready because the support test
      // for it is not run until after DOM ready
      jQuery(function() {
      	// Support: Android 2.3
      	if ( !jQuery.support.reliableMarginRight ) {
      		jQuery.cssHooks.marginRight = {
      			get: function( elem, computed ) {
      				if ( computed ) {
      					// Support: Android 2.3
      					// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
      					// Work around by temporarily setting element display to inline-block
      					return jQuery.swap( elem, { "display": "inline-block" },
      						curCSS, [ elem, "marginRight" ] );
      				}
      			}
      		};
      	}
      
      	// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
      	// getComputedStyle returns percent when specified for top/left/bottom/right
      	// rather than make the css module depend on the offset module, we just check for it here
      	if ( !jQuery.support.pixelPosition && jQuery.fn.position ) {
      		jQuery.each( [ "top", "left" ], function( i, prop ) {
      			jQuery.cssHooks[ prop ] = {
      				get: function( elem, computed ) {
      					if ( computed ) {
      						computed = curCSS( elem, prop );
      						// if curCSS returns percentage, fallback to offset
      						return rnumnonpx.test( computed ) ?
      							jQuery( elem ).position()[ prop ] + "px" :
      							computed;
      					}
      				}
      			};
      		});
      	}
      
      });
      
      if ( jQuery.expr && jQuery.expr.filters ) {
      	jQuery.expr.filters.hidden = function( elem ) {
      		// Support: Opera <= 12.12
      		// Opera reports offsetWidths and offsetHeights less than zero on some elements
      		return elem.offsetWidth <= 0 && elem.offsetHeight <= 0;
      	};
      
      	jQuery.expr.filters.visible = function( elem ) {
      		return !jQuery.expr.filters.hidden( elem );
      	};
      }
      
      // These hooks are used by animate to expand properties
      jQuery.each({
      	margin: "",
      	padding: "",
      	border: "Width"
      }, function( prefix, suffix ) {
      	jQuery.cssHooks[ prefix + suffix ] = {
      		expand: function( value ) {
      			var i = 0,
      				expanded = {},
      
      				// assumes a single number if not a string
      				parts = typeof value === "string" ? value.split(" ") : [ value ];
      
      			for ( ; i < 4; i++ ) {
      				expanded[ prefix + cssExpand[ i ] + suffix ] =
      					parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
      			}
      
      			return expanded;
      		}
      	};
      
      	if ( !rmargin.test( prefix ) ) {
      		jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
      	}
      });
      var r20 = /%20/g,
      	rbracket = /\[\]$/,
      	rCRLF = /\r?\n/g,
      	rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
      	rsubmittable = /^(?:input|select|textarea|keygen)/i;
      
      jQuery.fn.extend({
      	serialize: function() {
      		return jQuery.param( this.serializeArray() );
      	},
      	serializeArray: function() {
      		return this.map(function(){
      			// Can add propHook for "elements" to filter or add form elements
      			var elements = jQuery.prop( this, "elements" );
      			return elements ? jQuery.makeArray( elements ) : this;
      		})
      		.filter(function(){
      			var type = this.type;
      			// Use .is(":disabled") so that fieldset[disabled] works
      			return this.name && !jQuery( this ).is( ":disabled" ) &&
      				rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
      				( this.checked || !manipulation_rcheckableType.test( type ) );
      		})
      		.map(function( i, elem ){
      			var val = jQuery( this ).val();
      
      			return val == null ?
      				null :
      				jQuery.isArray( val ) ?
      					jQuery.map( val, function( val ){
      						return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
      					}) :
      					{ name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
      		}).get();
      	}
      });
      
      //Serialize an array of form elements or a set of
      //key/values into a query string
      jQuery.param = function( a, traditional ) {
      	var prefix,
      		s = [],
      		add = function( key, value ) {
      			// If value is a function, invoke it and return its value
      			value = jQuery.isFunction( value ) ? value() : ( value == null ? "" : value );
      			s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
      		};
      
      	// Set traditional to true for jQuery <= 1.3.2 behavior.
      	if ( traditional === undefined ) {
      		traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;
      	}
      
      	// If an array was passed in, assume that it is an array of form elements.
      	if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {
      		// Serialize the form elements
      		jQuery.each( a, function() {
      			add( this.name, this.value );
      		});
      
      	} else {
      		// If traditional, encode the "old" way (the way 1.3.2 or older
      		// did it), otherwise encode params recursively.
      		for ( prefix in a ) {
      			buildParams( prefix, a[ prefix ], traditional, add );
      		}
      	}
      
      	// Return the resulting serialization
      	return s.join( "&" ).replace( r20, "+" );
      };
      
      function buildParams( prefix, obj, traditional, add ) {
      	var name;
      
      	if ( jQuery.isArray( obj ) ) {
      		// Serialize array item.
      		jQuery.each( obj, function( i, v ) {
      			if ( traditional || rbracket.test( prefix ) ) {
      				// Treat each array item as a scalar.
      				add( prefix, v );
      
      			} else {
      				// Item is non-scalar (array or object), encode its numeric index.
      				buildParams( prefix + "[" + ( typeof v === "object" ? i : "" ) + "]", v, traditional, add );
      			}
      		});
      
      	} else if ( !traditional && jQuery.type( obj ) === "object" ) {
      		// Serialize object item.
      		for ( name in obj ) {
      			buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
      		}
      
      	} else {
      		// Serialize scalar item.
      		add( prefix, obj );
      	}
      }
      jQuery.each( ("blur focus focusin focusout load resize scroll unload click dblclick " +
      	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
      	"change select submit keydown keypress keyup error contextmenu").split(" "), function( i, name ) {
      
      	// Handle event binding
      	jQuery.fn[ name ] = function( data, fn ) {
      		return arguments.length > 0 ?
      			this.on( name, null, data, fn ) :
      			this.trigger( name );
      	};
      });
      
      jQuery.fn.extend({
      	hover: function( fnOver, fnOut ) {
      		return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
      	},
      
      	bind: function( types, data, fn ) {
      		return this.on( types, null, data, fn );
      	},
      	unbind: function( types, fn ) {
      		return this.off( types, null, fn );
      	},
      
      	delegate: function( selector, types, data, fn ) {
      		return this.on( types, selector, data, fn );
      	},
      	undelegate: function( selector, types, fn ) {
      		// ( namespace ) or ( selector, types [, fn] )
      		return arguments.length === 1 ? this.off( selector, "**" ) : this.off( types, selector || "**", fn );
      	}
      });
      var
      	// Document location
      	ajaxLocParts,
      	ajaxLocation,
      
      	ajax_nonce = jQuery.now(),
      
      	ajax_rquery = /\?/,
      	rhash = /#.*$/,
      	rts = /([?&])_=[^&]*/,
      	rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg,
      	// #7653, #8125, #8152: local protocol detection
      	rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
      	rnoContent = /^(?:GET|HEAD)$/,
      	rprotocol = /^\/\//,
      	rurl = /^([\w.+-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/,
      
      	// Keep a copy of the old load method
      	_load = jQuery.fn.load,
      
      	/* Prefilters
      	 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
      	 * 2) These are called:
      	 *    - BEFORE asking for a transport
      	 *    - AFTER param serialization (s.data is a string if s.processData is true)
      	 * 3) key is the dataType
      	 * 4) the catchall symbol "*" can be used
      	 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
      	 */
      	prefilters = {},
      
      	/* Transports bindings
      	 * 1) key is the dataType
      	 * 2) the catchall symbol "*" can be used
      	 * 3) selection will start with transport dataType and THEN go to "*" if needed
      	 */
      	transports = {},
      
      	// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
      	allTypes = "*/".concat("*");
      
      // #8138, IE may throw an exception when accessing
      // a field from window.location if document.domain has been set
      try {
      	ajaxLocation = location.href;
      } catch( e ) {
      	// Use the href attribute of an A element
      	// since IE will modify it given document.location
      	ajaxLocation = document.createElement( "a" );
      	ajaxLocation.href = "";
      	ajaxLocation = ajaxLocation.href;
      }
      
      // Segment location into parts
      ajaxLocParts = rurl.exec( ajaxLocation.toLowerCase() ) || [];
      
      // Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
      function addToPrefiltersOrTransports( structure ) {
      
      	// dataTypeExpression is optional and defaults to "*"
      	return function( dataTypeExpression, func ) {
      
      		if ( typeof dataTypeExpression !== "string" ) {
      			func = dataTypeExpression;
      			dataTypeExpression = "*";
      		}
      
      		var dataType,
      			i = 0,
      			dataTypes = dataTypeExpression.toLowerCase().match( core_rnotwhite ) || [];
      
      		if ( jQuery.isFunction( func ) ) {
      			// For each dataType in the dataTypeExpression
      			while ( (dataType = dataTypes[i++]) ) {
      				// Prepend if requested
      				if ( dataType[0] === "+" ) {
      					dataType = dataType.slice( 1 ) || "*";
      					(structure[ dataType ] = structure[ dataType ] || []).unshift( func );
      
      				// Otherwise append
      				} else {
      					(structure[ dataType ] = structure[ dataType ] || []).push( func );
      				}
      			}
      		}
      	};
      }
      
      // Base inspection function for prefilters and transports
      function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR ) {
      
      	var inspected = {},
      		seekingTransport = ( structure === transports );
      
      	function inspect( dataType ) {
      		var selected;
      		inspected[ dataType ] = true;
      		jQuery.each( structure[ dataType ] || [], function( _, prefilterOrFactory ) {
      			var dataTypeOrTransport = prefilterOrFactory( options, originalOptions, jqXHR );
      			if( typeof dataTypeOrTransport === "string" && !seekingTransport && !inspected[ dataTypeOrTransport ] ) {
      				options.dataTypes.unshift( dataTypeOrTransport );
      				inspect( dataTypeOrTransport );
      				return false;
      			} else if ( seekingTransport ) {
      				return !( selected = dataTypeOrTransport );
      			}
      		});
      		return selected;
      	}
      
      	return inspect( options.dataTypes[ 0 ] ) || !inspected[ "*" ] && inspect( "*" );
      }
      
      // A special extend for ajax options
      // that takes "flat" options (not to be deep extended)
      // Fixes #9887
      function ajaxExtend( target, src ) {
      	var key, deep,
      		flatOptions = jQuery.ajaxSettings.flatOptions || {};
      
      	for ( key in src ) {
      		if ( src[ key ] !== undefined ) {
      			( flatOptions[ key ] ? target : ( deep || (deep = {}) ) )[ key ] = src[ key ];
      		}
      	}
      	if ( deep ) {
      		jQuery.extend( true, target, deep );
      	}
      
      	return target;
      }
      
      jQuery.fn.load = function( url, params, callback ) {
      	if ( typeof url !== "string" && _load ) {
      		return _load.apply( this, arguments );
      	}
      
      	var selector, type, response,
      		self = this,
      		off = url.indexOf(" ");
      
      	if ( off >= 0 ) {
      		selector = url.slice( off );
      		url = url.slice( 0, off );
      	}
      
      	// If it's a function
      	if ( jQuery.isFunction( params ) ) {
      
      		// We assume that it's the callback
      		callback = params;
      		params = undefined;
      
      	// Otherwise, build a param string
      	} else if ( params && typeof params === "object" ) {
      		type = "POST";
      	}
      
      	// If we have elements to modify, make the request
      	if ( self.length > 0 ) {
      		jQuery.ajax({
      			url: url,
      
      			// if "type" variable is undefined, then "GET" method will be used
      			type: type,
      			dataType: "html",
      			data: params
      		}).done(function( responseText ) {
      
      			// Save response for use in complete callback
      			response = arguments;
      
      			self.html( selector ?
      
      				// If a selector was specified, locate the right elements in a dummy div
      				// Exclude scripts to avoid IE 'Permission Denied' errors
      				jQuery("<div>").append( jQuery.parseHTML( responseText ) ).find( selector ) :
      
      				// Otherwise use the full result
      				responseText );
      
      		}).complete( callback && function( jqXHR, status ) {
      			self.each( callback, response || [ jqXHR.responseText, status, jqXHR ] );
      		});
      	}
      
      	return this;
      };
      
      // Attach a bunch of functions for handling common AJAX events
      jQuery.each( [ "ajaxStart", "ajaxStop", "ajaxComplete", "ajaxError", "ajaxSuccess", "ajaxSend" ], function( i, type ){
      	jQuery.fn[ type ] = function( fn ){
      		return this.on( type, fn );
      	};
      });
      
      jQuery.extend({
      
      	// Counter for holding the number of active queries
      	active: 0,
      
      	// Last-Modified header cache for next request
      	lastModified: {},
      	etag: {},
      
      	ajaxSettings: {
      		url: ajaxLocation,
      		type: "GET",
      		isLocal: rlocalProtocol.test( ajaxLocParts[ 1 ] ),
      		global: true,
      		processData: true,
      		async: true,
      		contentType: "application/x-www-form-urlencoded; charset=UTF-8",
      		/*
      		timeout: 0,
      		data: null,
      		dataType: null,
      		username: null,
      		password: null,
      		cache: null,
      		throws: false,
      		traditional: false,
      		headers: {},
      		*/
      
      		accepts: {
      			"*": allTypes,
      			text: "text/plain",
      			html: "text/html",
      			xml: "application/xml, text/xml",
      			json: "application/json, text/javascript"
      		},
      
      		contents: {
      			xml: /xml/,
      			html: /html/,
      			json: /json/
      		},
      
      		responseFields: {
      			xml: "responseXML",
      			text: "responseText",
      			json: "responseJSON"
      		},
      
      		// Data converters
      		// Keys separate source (or catchall "*") and destination types with a single space
      		converters: {
      
      			// Convert anything to text
      			"* text": String,
      
      			// Text to html (true = no transformation)
      			"text html": true,
      
      			// Evaluate text as a json expression
      			"text json": jQuery.parseJSON,
      
      			// Parse text as xml
      			"text xml": jQuery.parseXML
      		},
      
      		// For options that shouldn't be deep extended:
      		// you can add your own custom options here if
      		// and when you create one that shouldn't be
      		// deep extended (see ajaxExtend)
      		flatOptions: {
      			url: true,
      			context: true
      		}
      	},
      
      	// Creates a full fledged settings object into target
      	// with both ajaxSettings and settings fields.
      	// If target is omitted, writes into ajaxSettings.
      	ajaxSetup: function( target, settings ) {
      		return settings ?
      
      			// Building a settings object
      			ajaxExtend( ajaxExtend( target, jQuery.ajaxSettings ), settings ) :
      
      			// Extending ajaxSettings
      			ajaxExtend( jQuery.ajaxSettings, target );
      	},
      
      	ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
      	ajaxTransport: addToPrefiltersOrTransports( transports ),
      
      	// Main method
      	ajax: function( url, options ) {
      
      		// If url is an object, simulate pre-1.5 signature
      		if ( typeof url === "object" ) {
      			options = url;
      			url = undefined;
      		}
      
      		// Force options to be an object
      		options = options || {};
      
      		var transport,
      			// URL without anti-cache param
      			cacheURL,
      			// Response headers
      			responseHeadersString,
      			responseHeaders,
      			// timeout handle
      			timeoutTimer,
      			// Cross-domain detection vars
      			parts,
      			// To know if global events are to be dispatched
      			fireGlobals,
      			// Loop variable
      			i,
      			// Create the final options object
      			s = jQuery.ajaxSetup( {}, options ),
      			// Callbacks context
      			callbackContext = s.context || s,
      			// Context for global events is callbackContext if it is a DOM node or jQuery collection
      			globalEventContext = s.context && ( callbackContext.nodeType || callbackContext.jquery ) ?
      				jQuery( callbackContext ) :
      				jQuery.event,
      			// Deferreds
      			deferred = jQuery.Deferred(),
      			completeDeferred = jQuery.Callbacks("once memory"),
      			// Status-dependent callbacks
      			statusCode = s.statusCode || {},
      			// Headers (they are sent all at once)
      			requestHeaders = {},
      			requestHeadersNames = {},
      			// The jqXHR state
      			state = 0,
      			// Default abort message
      			strAbort = "canceled",
      			// Fake xhr
      			jqXHR = {
      				readyState: 0,
      
      				// Builds headers hashtable if needed
      				getResponseHeader: function( key ) {
      					var match;
      					if ( state === 2 ) {
      						if ( !responseHeaders ) {
      							responseHeaders = {};
      							while ( (match = rheaders.exec( responseHeadersString )) ) {
      								responseHeaders[ match[1].toLowerCase() ] = match[ 2 ];
      							}
      						}
      						match = responseHeaders[ key.toLowerCase() ];
      					}
      					return match == null ? null : match;
      				},
      
      				// Raw string
      				getAllResponseHeaders: function() {
      					return state === 2 ? responseHeadersString : null;
      				},
      
      				// Caches the header
      				setRequestHeader: function( name, value ) {
      					var lname = name.toLowerCase();
      					if ( !state ) {
      						name = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name;
      						requestHeaders[ name ] = value;
      					}
      					return this;
      				},
      
      				// Overrides response content-type header
      				overrideMimeType: function( type ) {
      					if ( !state ) {
      						s.mimeType = type;
      					}
      					return this;
      				},
      
      				// Status-dependent callbacks
      				statusCode: function( map ) {
      					var code;
      					if ( map ) {
      						if ( state < 2 ) {
      							for ( code in map ) {
      								// Lazy-add the new callback in a way that preserves old ones
      								statusCode[ code ] = [ statusCode[ code ], map[ code ] ];
      							}
      						} else {
      							// Execute the appropriate callbacks
      							jqXHR.always( map[ jqXHR.status ] );
      						}
      					}
      					return this;
      				},
      
      				// Cancel the request
      				abort: function( statusText ) {
      					var finalText = statusText || strAbort;
      					if ( transport ) {
      						transport.abort( finalText );
      					}
      					done( 0, finalText );
      					return this;
      				}
      			};
      
      		// Attach deferreds
      		deferred.promise( jqXHR ).complete = completeDeferred.add;
      		jqXHR.success = jqXHR.done;
      		jqXHR.error = jqXHR.fail;
      
      		// Remove hash character (#7531: and string promotion)
      		// Add protocol if not provided (prefilters might expect it)
      		// Handle falsy url in the settings object (#10093: consistency with old signature)
      		// We also use the url parameter if available
      		s.url = ( ( url || s.url || ajaxLocation ) + "" ).replace( rhash, "" )
      			.replace( rprotocol, ajaxLocParts[ 1 ] + "//" );
      
      		// Alias method option to type as per ticket #12004
      		s.type = options.method || options.type || s.method || s.type;
      
      		// Extract dataTypes list
      		s.dataTypes = jQuery.trim( s.dataType || "*" ).toLowerCase().match( core_rnotwhite ) || [""];
      
      		// A cross-domain request is in order when we have a protocol:host:port mismatch
      		if ( s.crossDomain == null ) {
      			parts = rurl.exec( s.url.toLowerCase() );
      			s.crossDomain = !!( parts &&
      				( parts[ 1 ] !== ajaxLocParts[ 1 ] || parts[ 2 ] !== ajaxLocParts[ 2 ] ||
      					( parts[ 3 ] || ( parts[ 1 ] === "http:" ? "80" : "443" ) ) !==
      						( ajaxLocParts[ 3 ] || ( ajaxLocParts[ 1 ] === "http:" ? "80" : "443" ) ) )
      			);
      		}
      
      		// Convert data if not already a string
      		if ( s.data && s.processData && typeof s.data !== "string" ) {
      			s.data = jQuery.param( s.data, s.traditional );
      		}
      
      		// Apply prefilters
      		inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );
      
      		// If request was aborted inside a prefilter, stop there
      		if ( state === 2 ) {
      			return jqXHR;
      		}
      
      		// We can fire global events as of now if asked to
      		fireGlobals = s.global;
      
      		// Watch for a new set of requests
      		if ( fireGlobals && jQuery.active++ === 0 ) {
      			jQuery.event.trigger("ajaxStart");
      		}
      
      		// Uppercase the type
      		s.type = s.type.toUpperCase();
      
      		// Determine if request has content
      		s.hasContent = !rnoContent.test( s.type );
      
      		// Save the URL in case we're toying with the If-Modified-Since
      		// and/or If-None-Match header later on
      		cacheURL = s.url;
      
      		// More options handling for requests with no content
      		if ( !s.hasContent ) {
      
      			// If data is available, append data to url
      			if ( s.data ) {
      				cacheURL = ( s.url += ( ajax_rquery.test( cacheURL ) ? "&" : "?" ) + s.data );
      				// #9682: remove data so that it's not used in an eventual retry
      				delete s.data;
      			}
      
      			// Add anti-cache in url if needed
      			if ( s.cache === false ) {
      				s.url = rts.test( cacheURL ) ?
      
      					// If there is already a '_' parameter, set its value
      					cacheURL.replace( rts, "$1_=" + ajax_nonce++ ) :
      
      					// Otherwise add one to the end
      					cacheURL + ( ajax_rquery.test( cacheURL ) ? "&" : "?" ) + "_=" + ajax_nonce++;
      			}
      		}
      
      		// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
      		if ( s.ifModified ) {
      			if ( jQuery.lastModified[ cacheURL ] ) {
      				jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ cacheURL ] );
      			}
      			if ( jQuery.etag[ cacheURL ] ) {
      				jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ cacheURL ] );
      			}
      		}
      
      		// Set the correct header, if data is being sent
      		if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
      			jqXHR.setRequestHeader( "Content-Type", s.contentType );
      		}
      
      		// Set the Accepts header for the server, depending on the dataType
      		jqXHR.setRequestHeader(
      			"Accept",
      			s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[0] ] ?
      				s.accepts[ s.dataTypes[0] ] + ( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
      				s.accepts[ "*" ]
      		);
      
      		// Check for headers option
      		for ( i in s.headers ) {
      			jqXHR.setRequestHeader( i, s.headers[ i ] );
      		}
      
      		// Allow custom headers/mimetypes and early abort
      		if ( s.beforeSend && ( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) {
      			// Abort if not done already and return
      			return jqXHR.abort();
      		}
      
      		// aborting is no longer a cancellation
      		strAbort = "abort";
      
      		// Install callbacks on deferreds
      		for ( i in { success: 1, error: 1, complete: 1 } ) {
      			jqXHR[ i ]( s[ i ] );
      		}
      
      		// Get transport
      		transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );
      
      		// If no transport, we auto-abort
      		if ( !transport ) {
      			done( -1, "No Transport" );
      		} else {
      			jqXHR.readyState = 1;
      
      			// Send global event
      			if ( fireGlobals ) {
      				globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
      			}
      			// Timeout
      			if ( s.async && s.timeout > 0 ) {
      				timeoutTimer = setTimeout(function() {
      					jqXHR.abort("timeout");
      				}, s.timeout );
      			}
      
      			try {
      				state = 1;
      				transport.send( requestHeaders, done );
      			} catch ( e ) {
      				// Propagate exception as error if not done
      				if ( state < 2 ) {
      					done( -1, e );
      				// Simply rethrow otherwise
      				} else {
      					throw e;
      				}
      			}
      		}
      
      		// Callback for when everything is done
      		function done( status, nativeStatusText, responses, headers ) {
      			var isSuccess, success, error, response, modified,
      				statusText = nativeStatusText;
      
      			// Called once
      			if ( state === 2 ) {
      				return;
      			}
      
      			// State is "done" now
      			state = 2;
      
      			// Clear timeout if it exists
      			if ( timeoutTimer ) {
      				clearTimeout( timeoutTimer );
      			}
      
      			// Dereference transport for early garbage collection
      			// (no matter how long the jqXHR object will be used)
      			transport = undefined;
      
      			// Cache response headers
      			responseHeadersString = headers || "";
      
      			// Set readyState
      			jqXHR.readyState = status > 0 ? 4 : 0;
      
      			// Determine if successful
      			isSuccess = status >= 200 && status < 300 || status === 304;
      
      			// Get response data
      			if ( responses ) {
      				response = ajaxHandleResponses( s, jqXHR, responses );
      			}
      
      			// Convert no matter what (that way responseXXX fields are always set)
      			response = ajaxConvert( s, response, jqXHR, isSuccess );
      
      			// If successful, handle type chaining
      			if ( isSuccess ) {
      
      				// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
      				if ( s.ifModified ) {
      					modified = jqXHR.getResponseHeader("Last-Modified");
      					if ( modified ) {
      						jQuery.lastModified[ cacheURL ] = modified;
      					}
      					modified = jqXHR.getResponseHeader("etag");
      					if ( modified ) {
      						jQuery.etag[ cacheURL ] = modified;
      					}
      				}
      
      				// if no content
      				if ( status === 204 || s.type === "HEAD" ) {
      					statusText = "nocontent";
      
      				// if not modified
      				} else if ( status === 304 ) {
      					statusText = "notmodified";
      
      				// If we have data, let's convert it
      				} else {
      					statusText = response.state;
      					success = response.data;
      					error = response.error;
      					isSuccess = !error;
      				}
      			} else {
      				// We extract error from statusText
      				// then normalize statusText and status for non-aborts
      				error = statusText;
      				if ( status || !statusText ) {
      					statusText = "error";
      					if ( status < 0 ) {
      						status = 0;
      					}
      				}
      			}
      
      			// Set data for the fake xhr object
      			jqXHR.status = status;
      			jqXHR.statusText = ( nativeStatusText || statusText ) + "";
      
      			// Success/Error
      			if ( isSuccess ) {
      				deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
      			} else {
      				deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
      			}
      
      			// Status-dependent callbacks
      			jqXHR.statusCode( statusCode );
      			statusCode = undefined;
      
      			if ( fireGlobals ) {
      				globalEventContext.trigger( isSuccess ? "ajaxSuccess" : "ajaxError",
      					[ jqXHR, s, isSuccess ? success : error ] );
      			}
      
      			// Complete
      			completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );
      
      			if ( fireGlobals ) {
      				globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );
      				// Handle the global AJAX counter
      				if ( !( --jQuery.active ) ) {
      					jQuery.event.trigger("ajaxStop");
      				}
      			}
      		}
      
      		return jqXHR;
      	},
      
      	getJSON: function( url, data, callback ) {
      		return jQuery.get( url, data, callback, "json" );
      	},
      
      	getScript: function( url, callback ) {
      		return jQuery.get( url, undefined, callback, "script" );
      	}
      });
      
      jQuery.each( [ "get", "post" ], function( i, method ) {
      	jQuery[ method ] = function( url, data, callback, type ) {
      		// shift arguments if data argument was omitted
      		if ( jQuery.isFunction( data ) ) {
      			type = type || callback;
      			callback = data;
      			data = undefined;
      		}
      
      		return jQuery.ajax({
      			url: url,
      			type: method,
      			dataType: type,
      			data: data,
      			success: callback
      		});
      	};
      });
      
      /* Handles responses to an ajax request:
       * - finds the right dataType (mediates between content-type and expected dataType)
       * - returns the corresponding response
       */
      function ajaxHandleResponses( s, jqXHR, responses ) {
      
      	var ct, type, finalDataType, firstDataType,
      		contents = s.contents,
      		dataTypes = s.dataTypes;
      
      	// Remove auto dataType and get content-type in the process
      	while( dataTypes[ 0 ] === "*" ) {
      		dataTypes.shift();
      		if ( ct === undefined ) {
      			ct = s.mimeType || jqXHR.getResponseHeader("Content-Type");
      		}
      	}
      
      	// Check if we're dealing with a known content-type
      	if ( ct ) {
      		for ( type in contents ) {
      			if ( contents[ type ] && contents[ type ].test( ct ) ) {
      				dataTypes.unshift( type );
      				break;
      			}
      		}
      	}
      
      	// Check to see if we have a response for the expected dataType
      	if ( dataTypes[ 0 ] in responses ) {
      		finalDataType = dataTypes[ 0 ];
      	} else {
      		// Try convertible dataTypes
      		for ( type in responses ) {
      			if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[0] ] ) {
      				finalDataType = type;
      				break;
      			}
      			if ( !firstDataType ) {
      				firstDataType = type;
      			}
      		}
      		// Or just use first one
      		finalDataType = finalDataType || firstDataType;
      	}
      
      	// If we found a dataType
      	// We add the dataType to the list if needed
      	// and return the corresponding response
      	if ( finalDataType ) {
      		if ( finalDataType !== dataTypes[ 0 ] ) {
      			dataTypes.unshift( finalDataType );
      		}
      		return responses[ finalDataType ];
      	}
      }
      
      /* Chain conversions given the request and the original response
       * Also sets the responseXXX fields on the jqXHR instance
       */
      function ajaxConvert( s, response, jqXHR, isSuccess ) {
      	var conv2, current, conv, tmp, prev,
      		converters = {},
      		// Work with a copy of dataTypes in case we need to modify it for conversion
      		dataTypes = s.dataTypes.slice();
      
      	// Create converters map with lowercased keys
      	if ( dataTypes[ 1 ] ) {
      		for ( conv in s.converters ) {
      			converters[ conv.toLowerCase() ] = s.converters[ conv ];
      		}
      	}
      
      	current = dataTypes.shift();
      
      	// Convert to each sequential dataType
      	while ( current ) {
      
      		if ( s.responseFields[ current ] ) {
      			jqXHR[ s.responseFields[ current ] ] = response;
      		}
      
      		// Apply the dataFilter if provided
      		if ( !prev && isSuccess && s.dataFilter ) {
      			response = s.dataFilter( response, s.dataType );
      		}
      
      		prev = current;
      		current = dataTypes.shift();
      
      		if ( current ) {
      
      		// There's only work to do if current dataType is non-auto
      			if ( current === "*" ) {
      
      				current = prev;
      
      			// Convert response if prev dataType is non-auto and differs from current
      			} else if ( prev !== "*" && prev !== current ) {
      
      				// Seek a direct converter
      				conv = converters[ prev + " " + current ] || converters[ "* " + current ];
      
      				// If none found, seek a pair
      				if ( !conv ) {
      					for ( conv2 in converters ) {
      
      						// If conv2 outputs current
      						tmp = conv2.split( " " );
      						if ( tmp[ 1 ] === current ) {
      
      							// If prev can be converted to accepted input
      							conv = converters[ prev + " " + tmp[ 0 ] ] ||
      								converters[ "* " + tmp[ 0 ] ];
      							if ( conv ) {
      								// Condense equivalence converters
      								if ( conv === true ) {
      									conv = converters[ conv2 ];
      
      								// Otherwise, insert the intermediate dataType
      								} else if ( converters[ conv2 ] !== true ) {
      									current = tmp[ 0 ];
      									dataTypes.unshift( tmp[ 1 ] );
      								}
      								break;
      							}
      						}
      					}
      				}
      
      				// Apply converter (if not an equivalence)
      				if ( conv !== true ) {
      
      					// Unless errors are allowed to bubble, catch and return them
      					if ( conv && s[ "throws" ] ) {
      						response = conv( response );
      					} else {
      						try {
      							response = conv( response );
      						} catch ( e ) {
      							return { state: "parsererror", error: conv ? e : "No conversion from " + prev + " to " + current };
      						}
      					}
      				}
      			}
      		}
      	}
      
      	return { state: "success", data: response };
      }
      // Install script dataType
      jQuery.ajaxSetup({
      	accepts: {
      		script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
      	},
      	contents: {
      		script: /(?:java|ecma)script/
      	},
      	converters: {
      		"text script": function( text ) {
      			jQuery.globalEval( text );
      			return text;
      		}
      	}
      });
      
      // Handle cache's special case and crossDomain
      jQuery.ajaxPrefilter( "script", function( s ) {
      	if ( s.cache === undefined ) {
      		s.cache = false;
      	}
      	if ( s.crossDomain ) {
      		s.type = "GET";
      	}
      });
      
      // Bind script tag hack transport
      jQuery.ajaxTransport( "script", function( s ) {
      	// This transport only deals with cross domain requests
      	if ( s.crossDomain ) {
      		var script, callback;
      		return {
      			send: function( _, complete ) {
      				script = jQuery("<script>").prop({
      					async: true,
      					charset: s.scriptCharset,
      					src: s.url
      				}).on(
      					"load error",
      					callback = function( evt ) {
      						script.remove();
      						callback = null;
      						if ( evt ) {
      							complete( evt.type === "error" ? 404 : 200, evt.type );
      						}
      					}
      				);
      				document.head.appendChild( script[ 0 ] );
      			},
      			abort: function() {
      				if ( callback ) {
      					callback();
      				}
      			}
      		};
      	}
      });
      var oldCallbacks = [],
      	rjsonp = /(=)\?(?=&|$)|\?\?/;
      
      // Default jsonp settings
      jQuery.ajaxSetup({
      	jsonp: "callback",
      	jsonpCallback: function() {
      		var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( ajax_nonce++ ) );
      		this[ callback ] = true;
      		return callback;
      	}
      });
      
      // Detect, normalize options and install callbacks for jsonp requests
      jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {
      
      	var callbackName, overwritten, responseContainer,
      		jsonProp = s.jsonp !== false && ( rjsonp.test( s.url ) ?
      			"url" :
      			typeof s.data === "string" && !( s.contentType || "" ).indexOf("application/x-www-form-urlencoded") && rjsonp.test( s.data ) && "data"
      		);
      
      	// Handle iff the expected data type is "jsonp" or we have a parameter to set
      	if ( jsonProp || s.dataTypes[ 0 ] === "jsonp" ) {
      
      		// Get callback name, remembering preexisting value associated with it
      		callbackName = s.jsonpCallback = jQuery.isFunction( s.jsonpCallback ) ?
      			s.jsonpCallback() :
      			s.jsonpCallback;
      
      		// Insert callback into url or form data
      		if ( jsonProp ) {
      			s[ jsonProp ] = s[ jsonProp ].replace( rjsonp, "$1" + callbackName );
      		} else if ( s.jsonp !== false ) {
      			s.url += ( ajax_rquery.test( s.url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
      		}
      
      		// Use data converter to retrieve json after script execution
      		s.converters["script json"] = function() {
      			if ( !responseContainer ) {
      				jQuery.error( callbackName + " was not called" );
      			}
      			return responseContainer[ 0 ];
      		};
      
      		// force json dataType
      		s.dataTypes[ 0 ] = "json";
      
      		// Install callback
      		overwritten = window[ callbackName ];
      		window[ callbackName ] = function() {
      			responseContainer = arguments;
      		};
      
      		// Clean-up function (fires after converters)
      		jqXHR.always(function() {
      			// Restore preexisting value
      			window[ callbackName ] = overwritten;
      
      			// Save back as free
      			if ( s[ callbackName ] ) {
      				// make sure that re-using the options doesn't screw things around
      				s.jsonpCallback = originalSettings.jsonpCallback;
      
      				// save the callback name for future use
      				oldCallbacks.push( callbackName );
      			}
      
      			// Call if it was a function and we have a response
      			if ( responseContainer && jQuery.isFunction( overwritten ) ) {
      				overwritten( responseContainer[ 0 ] );
      			}
      
      			responseContainer = overwritten = undefined;
      		});
      
      		// Delegate to script
      		return "script";
      	}
      });
      jQuery.ajaxSettings.xhr = function() {
      	try {
      		return new XMLHttpRequest();
      	} catch( e ) {}
      };
      
      var xhrSupported = jQuery.ajaxSettings.xhr(),
      	xhrSuccessStatus = {
      		// file protocol always yields status code 0, assume 200
      		0: 200,
      		// Support: IE9
      		// #1450: sometimes IE returns 1223 when it should be 204
      		1223: 204
      	},
      	// Support: IE9
      	// We need to keep track of outbound xhr and abort them manually
      	// because IE is not smart enough to do it all by itself
      	xhrId = 0,
      	xhrCallbacks = {};
      
      if ( window.ActiveXObject ) {
      	jQuery( window ).on( "unload", function() {
      		for( var key in xhrCallbacks ) {
      			xhrCallbacks[ key ]();
      		}
      		xhrCallbacks = undefined;
      	});
      }
      
      jQuery.support.cors = !!xhrSupported && ( "withCredentials" in xhrSupported );
      jQuery.support.ajax = xhrSupported = !!xhrSupported;
      
      jQuery.ajaxTransport(function( options ) {
      	var callback;
      	// Cross domain only allowed if supported through XMLHttpRequest
      	if ( jQuery.support.cors || xhrSupported && !options.crossDomain ) {
      		return {
      			send: function( headers, complete ) {
      				var i, id,
      					xhr = options.xhr();
      				xhr.open( options.type, options.url, options.async, options.username, options.password );
      				// Apply custom fields if provided
      				if ( options.xhrFields ) {
      					for ( i in options.xhrFields ) {
      						xhr[ i ] = options.xhrFields[ i ];
      					}
      				}
      				// Override mime type if needed
      				if ( options.mimeType && xhr.overrideMimeType ) {
      					xhr.overrideMimeType( options.mimeType );
      				}
      				// X-Requested-With header
      				// For cross-domain requests, seeing as conditions for a preflight are
      				// akin to a jigsaw puzzle, we simply never set it to be sure.
      				// (it can always be set on a per-request basis or even using ajaxSetup)
      				// For same-domain requests, won't change header if already provided.
      				if ( !options.crossDomain && !headers["X-Requested-With"] ) {
      					headers["X-Requested-With"] = "XMLHttpRequest";
      				}
      				// Set headers
      				for ( i in headers ) {
      					xhr.setRequestHeader( i, headers[ i ] );
      				}
      				// Callback
      				callback = function( type ) {
      					return function() {
      						if ( callback ) {
      							delete xhrCallbacks[ id ];
      							callback = xhr.onload = xhr.onerror = null;
      							if ( type === "abort" ) {
      								xhr.abort();
      							} else if ( type === "error" ) {
      								complete(
      									// file protocol always yields status 0, assume 404
      									xhr.status || 404,
      									xhr.statusText
      								);
      							} else {
      								complete(
      									xhrSuccessStatus[ xhr.status ] || xhr.status,
      									xhr.statusText,
      									// Support: IE9
      									// #11426: When requesting binary data, IE9 will throw an exception
      									// on any attempt to access responseText
      									typeof xhr.responseText === "string" ? {
      										text: xhr.responseText
      									} : undefined,
      									xhr.getAllResponseHeaders()
      								);
      							}
      						}
      					};
      				};
      				// Listen to events
      				xhr.onload = callback();
      				xhr.onerror = callback("error");
      				// Create the abort callback
      				callback = xhrCallbacks[( id = xhrId++ )] = callback("abort");
      				// Do send the request
      				// This may raise an exception which is actually
      				// handled in jQuery.ajax (so no try/catch here)
      				xhr.send( options.hasContent && options.data || null );
      			},
      			abort: function() {
      				if ( callback ) {
      					callback();
      				}
      			}
      		};
      	}
      });
      var fxNow, timerId,
      	rfxtypes = /^(?:toggle|show|hide)$/,
      	rfxnum = new RegExp( "^(?:([+-])=|)(" + core_pnum + ")([a-z%]*)$", "i" ),
      	rrun = /queueHooks$/,
      	animationPrefilters = [ defaultPrefilter ],
      	tweeners = {
      		"*": [function( prop, value ) {
      			var tween = this.createTween( prop, value ),
      				target = tween.cur(),
      				parts = rfxnum.exec( value ),
      				unit = parts && parts[ 3 ] || ( jQuery.cssNumber[ prop ] ? "" : "px" ),
      
      				// Starting value computation is required for potential unit mismatches
      				start = ( jQuery.cssNumber[ prop ] || unit !== "px" && +target ) &&
      					rfxnum.exec( jQuery.css( tween.elem, prop ) ),
      				scale = 1,
      				maxIterations = 20;
      
      			if ( start && start[ 3 ] !== unit ) {
      				// Trust units reported by jQuery.css
      				unit = unit || start[ 3 ];
      
      				// Make sure we update the tween properties later on
      				parts = parts || [];
      
      				// Iteratively approximate from a nonzero starting point
      				start = +target || 1;
      
      				do {
      					// If previous iteration zeroed out, double until we get *something*
      					// Use a string for doubling factor so we don't accidentally see scale as unchanged below
      					scale = scale || ".5";
      
      					// Adjust and apply
      					start = start / scale;
      					jQuery.style( tween.elem, prop, start + unit );
      
      				// Update scale, tolerating zero or NaN from tween.cur()
      				// And breaking the loop if scale is unchanged or perfect, or if we've just had enough
      				} while ( scale !== (scale = tween.cur() / target) && scale !== 1 && --maxIterations );
      			}
      
      			// Update tween properties
      			if ( parts ) {
      				start = tween.start = +start || +target || 0;
      				tween.unit = unit;
      				// If a +=/-= token was provided, we're doing a relative animation
      				tween.end = parts[ 1 ] ?
      					start + ( parts[ 1 ] + 1 ) * parts[ 2 ] :
      					+parts[ 2 ];
      			}
      
      			return tween;
      		}]
      	};
      
      // Animations created synchronously will run synchronously
      function createFxNow() {
      	setTimeout(function() {
      		fxNow = undefined;
      	});
      	return ( fxNow = jQuery.now() );
      }
      
      function createTween( value, prop, animation ) {
      	var tween,
      		collection = ( tweeners[ prop ] || [] ).concat( tweeners[ "*" ] ),
      		index = 0,
      		length = collection.length;
      	for ( ; index < length; index++ ) {
      		if ( (tween = collection[ index ].call( animation, prop, value )) ) {
      
      			// we're done with this property
      			return tween;
      		}
      	}
      }
      
      function Animation( elem, properties, options ) {
      	var result,
      		stopped,
      		index = 0,
      		length = animationPrefilters.length,
      		deferred = jQuery.Deferred().always( function() {
      			// don't match elem in the :animated selector
      			delete tick.elem;
      		}),
      		tick = function() {
      			if ( stopped ) {
      				return false;
      			}
      			var currentTime = fxNow || createFxNow(),
      				remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),
      				// archaic crash bug won't allow us to use 1 - ( 0.5 || 0 ) (#12497)
      				temp = remaining / animation.duration || 0,
      				percent = 1 - temp,
      				index = 0,
      				length = animation.tweens.length;
      
      			for ( ; index < length ; index++ ) {
      				animation.tweens[ index ].run( percent );
      			}
      
      			deferred.notifyWith( elem, [ animation, percent, remaining ]);
      
      			if ( percent < 1 && length ) {
      				return remaining;
      			} else {
      				deferred.resolveWith( elem, [ animation ] );
      				return false;
      			}
      		},
      		animation = deferred.promise({
      			elem: elem,
      			props: jQuery.extend( {}, properties ),
      			opts: jQuery.extend( true, { specialEasing: {} }, options ),
      			originalProperties: properties,
      			originalOptions: options,
      			startTime: fxNow || createFxNow(),
      			duration: options.duration,
      			tweens: [],
      			createTween: function( prop, end ) {
      				var tween = jQuery.Tween( elem, animation.opts, prop, end,
      						animation.opts.specialEasing[ prop ] || animation.opts.easing );
      				animation.tweens.push( tween );
      				return tween;
      			},
      			stop: function( gotoEnd ) {
      				var index = 0,
      					// if we are going to the end, we want to run all the tweens
      					// otherwise we skip this part
      					length = gotoEnd ? animation.tweens.length : 0;
      				if ( stopped ) {
      					return this;
      				}
      				stopped = true;
      				for ( ; index < length ; index++ ) {
      					animation.tweens[ index ].run( 1 );
      				}
      
      				// resolve when we played the last frame
      				// otherwise, reject
      				if ( gotoEnd ) {
      					deferred.resolveWith( elem, [ animation, gotoEnd ] );
      				} else {
      					deferred.rejectWith( elem, [ animation, gotoEnd ] );
      				}
      				return this;
      			}
      		}),
      		props = animation.props;
      
      	propFilter( props, animation.opts.specialEasing );
      
      	for ( ; index < length ; index++ ) {
      		result = animationPrefilters[ index ].call( animation, elem, props, animation.opts );
      		if ( result ) {
      			return result;
      		}
      	}
      
      	jQuery.map( props, createTween, animation );
      
      	if ( jQuery.isFunction( animation.opts.start ) ) {
      		animation.opts.start.call( elem, animation );
      	}
      
      	jQuery.fx.timer(
      		jQuery.extend( tick, {
      			elem: elem,
      			anim: animation,
      			queue: animation.opts.queue
      		})
      	);
      
      	// attach callbacks from options
      	return animation.progress( animation.opts.progress )
      		.done( animation.opts.done, animation.opts.complete )
      		.fail( animation.opts.fail )
      		.always( animation.opts.always );
      }
      
      function propFilter( props, specialEasing ) {
      	var index, name, easing, value, hooks;
      
      	// camelCase, specialEasing and expand cssHook pass
      	for ( index in props ) {
      		name = jQuery.camelCase( index );
      		easing = specialEasing[ name ];
      		value = props[ index ];
      		if ( jQuery.isArray( value ) ) {
      			easing = value[ 1 ];
      			value = props[ index ] = value[ 0 ];
      		}
      
      		if ( index !== name ) {
      			props[ name ] = value;
      			delete props[ index ];
      		}
      
      		hooks = jQuery.cssHooks[ name ];
      		if ( hooks && "expand" in hooks ) {
      			value = hooks.expand( value );
      			delete props[ name ];
      
      			// not quite $.extend, this wont overwrite keys already present.
      			// also - reusing 'index' from above because we have the correct "name"
      			for ( index in value ) {
      				if ( !( index in props ) ) {
      					props[ index ] = value[ index ];
      					specialEasing[ index ] = easing;
      				}
      			}
      		} else {
      			specialEasing[ name ] = easing;
      		}
      	}
      }
      
      jQuery.Animation = jQuery.extend( Animation, {
      
      	tweener: function( props, callback ) {
      		if ( jQuery.isFunction( props ) ) {
      			callback = props;
      			props = [ "*" ];
      		} else {
      			props = props.split(" ");
      		}
      
      		var prop,
      			index = 0,
      			length = props.length;
      
      		for ( ; index < length ; index++ ) {
      			prop = props[ index ];
      			tweeners[ prop ] = tweeners[ prop ] || [];
      			tweeners[ prop ].unshift( callback );
      		}
      	},
      
      	prefilter: function( callback, prepend ) {
      		if ( prepend ) {
      			animationPrefilters.unshift( callback );
      		} else {
      			animationPrefilters.push( callback );
      		}
      	}
      });
      
      function defaultPrefilter( elem, props, opts ) {
      	/* jshint validthis: true */
      	var prop, value, toggle, tween, hooks, oldfire,
      		anim = this,
      		orig = {},
      		style = elem.style,
      		hidden = elem.nodeType && isHidden( elem ),
      		dataShow = data_priv.get( elem, "fxshow" );
      
      	// handle queue: false promises
      	if ( !opts.queue ) {
      		hooks = jQuery._queueHooks( elem, "fx" );
      		if ( hooks.unqueued == null ) {
      			hooks.unqueued = 0;
      			oldfire = hooks.empty.fire;
      			hooks.empty.fire = function() {
      				if ( !hooks.unqueued ) {
      					oldfire();
      				}
      			};
      		}
      		hooks.unqueued++;
      
      		anim.always(function() {
      			// doing this makes sure that the complete handler will be called
      			// before this completes
      			anim.always(function() {
      				hooks.unqueued--;
      				if ( !jQuery.queue( elem, "fx" ).length ) {
      					hooks.empty.fire();
      				}
      			});
      		});
      	}
      
      	// height/width overflow pass
      	if ( elem.nodeType === 1 && ( "height" in props || "width" in props ) ) {
      		// Make sure that nothing sneaks out
      		// Record all 3 overflow attributes because IE9-10 do not
      		// change the overflow attribute when overflowX and
      		// overflowY are set to the same value
      		opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];
      
      		// Set display property to inline-block for height/width
      		// animations on inline elements that are having width/height animated
      		if ( jQuery.css( elem, "display" ) === "inline" &&
      				jQuery.css( elem, "float" ) === "none" ) {
      
      			style.display = "inline-block";
      		}
      	}
      
      	if ( opts.overflow ) {
      		style.overflow = "hidden";
      		anim.always(function() {
      			style.overflow = opts.overflow[ 0 ];
      			style.overflowX = opts.overflow[ 1 ];
      			style.overflowY = opts.overflow[ 2 ];
      		});
      	}
      
      
      	// show/hide pass
      	for ( prop in props ) {
      		value = props[ prop ];
      		if ( rfxtypes.exec( value ) ) {
      			delete props[ prop ];
      			toggle = toggle || value === "toggle";
      			if ( value === ( hidden ? "hide" : "show" ) ) {
      
      				// If there is dataShow left over from a stopped hide or show and we are going to proceed with show, we should pretend to be hidden
      				if ( value === "show" && dataShow && dataShow[ prop ] !== undefined ) {
      					hidden = true;
      				} else {
      					continue;
      				}
      			}
      			orig[ prop ] = dataShow && dataShow[ prop ] || jQuery.style( elem, prop );
      		}
      	}
      
      	if ( !jQuery.isEmptyObject( orig ) ) {
      		if ( dataShow ) {
      			if ( "hidden" in dataShow ) {
      				hidden = dataShow.hidden;
      			}
      		} else {
      			dataShow = data_priv.access( elem, "fxshow", {} );
      		}
      
      		// store state if its toggle - enables .stop().toggle() to "reverse"
      		if ( toggle ) {
      			dataShow.hidden = !hidden;
      		}
      		if ( hidden ) {
      			jQuery( elem ).show();
      		} else {
      			anim.done(function() {
      				jQuery( elem ).hide();
      			});
      		}
      		anim.done(function() {
      			var prop;
      
      			data_priv.remove( elem, "fxshow" );
      			for ( prop in orig ) {
      				jQuery.style( elem, prop, orig[ prop ] );
      			}
      		});
      		for ( prop in orig ) {
      			tween = createTween( hidden ? dataShow[ prop ] : 0, prop, anim );
      
      			if ( !( prop in dataShow ) ) {
      				dataShow[ prop ] = tween.start;
      				if ( hidden ) {
      					tween.end = tween.start;
      					tween.start = prop === "width" || prop === "height" ? 1 : 0;
      				}
      			}
      		}
      	}
      }
      
      function Tween( elem, options, prop, end, easing ) {
      	return new Tween.prototype.init( elem, options, prop, end, easing );
      }
      jQuery.Tween = Tween;
      
      Tween.prototype = {
      	constructor: Tween,
      	init: function( elem, options, prop, end, easing, unit ) {
      		this.elem = elem;
      		this.prop = prop;
      		this.easing = easing || "swing";
      		this.options = options;
      		this.start = this.now = this.cur();
      		this.end = end;
      		this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
      	},
      	cur: function() {
      		var hooks = Tween.propHooks[ this.prop ];
      
      		return hooks && hooks.get ?
      			hooks.get( this ) :
      			Tween.propHooks._default.get( this );
      	},
      	run: function( percent ) {
      		var eased,
      			hooks = Tween.propHooks[ this.prop ];
      
      		if ( this.options.duration ) {
      			this.pos = eased = jQuery.easing[ this.easing ](
      				percent, this.options.duration * percent, 0, 1, this.options.duration
      			);
      		} else {
      			this.pos = eased = percent;
      		}
      		this.now = ( this.end - this.start ) * eased + this.start;
      
      		if ( this.options.step ) {
      			this.options.step.call( this.elem, this.now, this );
      		}
      
      		if ( hooks && hooks.set ) {
      			hooks.set( this );
      		} else {
      			Tween.propHooks._default.set( this );
      		}
      		return this;
      	}
      };
      
      Tween.prototype.init.prototype = Tween.prototype;
      
      Tween.propHooks = {
      	_default: {
      		get: function( tween ) {
      			var result;
      
      			if ( tween.elem[ tween.prop ] != null &&
      				(!tween.elem.style || tween.elem.style[ tween.prop ] == null) ) {
      				return tween.elem[ tween.prop ];
      			}
      
      			// passing an empty string as a 3rd parameter to .css will automatically
      			// attempt a parseFloat and fallback to a string if the parse fails
      			// so, simple values such as "10px" are parsed to Float.
      			// complex values such as "rotate(1rad)" are returned as is.
      			result = jQuery.css( tween.elem, tween.prop, "" );
      			// Empty strings, null, undefined and "auto" are converted to 0.
      			return !result || result === "auto" ? 0 : result;
      		},
      		set: function( tween ) {
      			// use step hook for back compat - use cssHook if its there - use .style if its
      			// available and use plain properties where available
      			if ( jQuery.fx.step[ tween.prop ] ) {
      				jQuery.fx.step[ tween.prop ]( tween );
      			} else if ( tween.elem.style && ( tween.elem.style[ jQuery.cssProps[ tween.prop ] ] != null || jQuery.cssHooks[ tween.prop ] ) ) {
      				jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
      			} else {
      				tween.elem[ tween.prop ] = tween.now;
      			}
      		}
      	}
      };
      
      // Support: IE9
      // Panic based approach to setting things on disconnected nodes
      
      Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
      	set: function( tween ) {
      		if ( tween.elem.nodeType && tween.elem.parentNode ) {
      			tween.elem[ tween.prop ] = tween.now;
      		}
      	}
      };
      
      jQuery.each([ "toggle", "show", "hide" ], function( i, name ) {
      	var cssFn = jQuery.fn[ name ];
      	jQuery.fn[ name ] = function( speed, easing, callback ) {
      		return speed == null || typeof speed === "boolean" ?
      			cssFn.apply( this, arguments ) :
      			this.animate( genFx( name, true ), speed, easing, callback );
      	};
      });
      
      jQuery.fn.extend({
      	fadeTo: function( speed, to, easing, callback ) {
      
      		// show any hidden elements after setting opacity to 0
      		return this.filter( isHidden ).css( "opacity", 0 ).show()
      
      			// animate to the value specified
      			.end().animate({ opacity: to }, speed, easing, callback );
      	},
      	animate: function( prop, speed, easing, callback ) {
      		var empty = jQuery.isEmptyObject( prop ),
      			optall = jQuery.speed( speed, easing, callback ),
      			doAnimation = function() {
      				// Operate on a copy of prop so per-property easing won't be lost
      				var anim = Animation( this, jQuery.extend( {}, prop ), optall );
      
      				// Empty animations, or finishing resolves immediately
      				if ( empty || data_priv.get( this, "finish" ) ) {
      					anim.stop( true );
      				}
      			};
      			doAnimation.finish = doAnimation;
      
      		return empty || optall.queue === false ?
      			this.each( doAnimation ) :
      			this.queue( optall.queue, doAnimation );
      	},
      	stop: function( type, clearQueue, gotoEnd ) {
      		var stopQueue = function( hooks ) {
      			var stop = hooks.stop;
      			delete hooks.stop;
      			stop( gotoEnd );
      		};
      
      		if ( typeof type !== "string" ) {
      			gotoEnd = clearQueue;
      			clearQueue = type;
      			type = undefined;
      		}
      		if ( clearQueue && type !== false ) {
      			this.queue( type || "fx", [] );
      		}
      
      		return this.each(function() {
      			var dequeue = true,
      				index = type != null && type + "queueHooks",
      				timers = jQuery.timers,
      				data = data_priv.get( this );
      
      			if ( index ) {
      				if ( data[ index ] && data[ index ].stop ) {
      					stopQueue( data[ index ] );
      				}
      			} else {
      				for ( index in data ) {
      					if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
      						stopQueue( data[ index ] );
      					}
      				}
      			}
      
      			for ( index = timers.length; index--; ) {
      				if ( timers[ index ].elem === this && (type == null || timers[ index ].queue === type) ) {
      					timers[ index ].anim.stop( gotoEnd );
      					dequeue = false;
      					timers.splice( index, 1 );
      				}
      			}
      
      			// start the next in the queue if the last step wasn't forced
      			// timers currently will call their complete callbacks, which will dequeue
      			// but only if they were gotoEnd
      			if ( dequeue || !gotoEnd ) {
      				jQuery.dequeue( this, type );
      			}
      		});
      	},
      	finish: function( type ) {
      		if ( type !== false ) {
      			type = type || "fx";
      		}
      		return this.each(function() {
      			var index,
      				data = data_priv.get( this ),
      				queue = data[ type + "queue" ],
      				hooks = data[ type + "queueHooks" ],
      				timers = jQuery.timers,
      				length = queue ? queue.length : 0;
      
      			// enable finishing flag on private data
      			data.finish = true;
      
      			// empty the queue first
      			jQuery.queue( this, type, [] );
      
      			if ( hooks && hooks.stop ) {
      				hooks.stop.call( this, true );
      			}
      
      			// look for any active animations, and finish them
      			for ( index = timers.length; index--; ) {
      				if ( timers[ index ].elem === this && timers[ index ].queue === type ) {
      					timers[ index ].anim.stop( true );
      					timers.splice( index, 1 );
      				}
      			}
      
      			// look for any animations in the old queue and finish them
      			for ( index = 0; index < length; index++ ) {
      				if ( queue[ index ] && queue[ index ].finish ) {
      					queue[ index ].finish.call( this );
      				}
      			}
      
      			// turn off finishing flag
      			delete data.finish;
      		});
      	}
      });
      
      // Generate parameters to create a standard animation
      function genFx( type, includeWidth ) {
      	var which,
      		attrs = { height: type },
      		i = 0;
      
      	// if we include width, step value is 1 to do all cssExpand values,
      	// if we don't include width, step value is 2 to skip over Left and Right
      	includeWidth = includeWidth? 1 : 0;
      	for( ; i < 4 ; i += 2 - includeWidth ) {
      		which = cssExpand[ i ];
      		attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
      	}
      
      	if ( includeWidth ) {
      		attrs.opacity = attrs.width = type;
      	}
      
      	return attrs;
      }
      
      // Generate shortcuts for custom animations
      jQuery.each({
      	slideDown: genFx("show"),
      	slideUp: genFx("hide"),
      	slideToggle: genFx("toggle"),
      	fadeIn: { opacity: "show" },
      	fadeOut: { opacity: "hide" },
      	fadeToggle: { opacity: "toggle" }
      }, function( name, props ) {
      	jQuery.fn[ name ] = function( speed, easing, callback ) {
      		return this.animate( props, speed, easing, callback );
      	};
      });
      
      jQuery.speed = function( speed, easing, fn ) {
      	var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
      		complete: fn || !fn && easing ||
      			jQuery.isFunction( speed ) && speed,
      		duration: speed,
      		easing: fn && easing || easing && !jQuery.isFunction( easing ) && easing
      	};
      
      	opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
      		opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[ opt.duration ] : jQuery.fx.speeds._default;
      
      	// normalize opt.queue - true/undefined/null -> "fx"
      	if ( opt.queue == null || opt.queue === true ) {
      		opt.queue = "fx";
      	}
      
      	// Queueing
      	opt.old = opt.complete;
      
      	opt.complete = function() {
      		if ( jQuery.isFunction( opt.old ) ) {
      			opt.old.call( this );
      		}
      
      		if ( opt.queue ) {
      			jQuery.dequeue( this, opt.queue );
      		}
      	};
      
      	return opt;
      };
      
      jQuery.easing = {
      	linear: function( p ) {
      		return p;
      	},
      	swing: function( p ) {
      		return 0.5 - Math.cos( p*Math.PI ) / 2;
      	}
      };
      
      jQuery.timers = [];
      jQuery.fx = Tween.prototype.init;
      jQuery.fx.tick = function() {
      	var timer,
      		timers = jQuery.timers,
      		i = 0;
      
      	fxNow = jQuery.now();
      
      	for ( ; i < timers.length; i++ ) {
      		timer = timers[ i ];
      		// Checks the timer has not already been removed
      		if ( !timer() && timers[ i ] === timer ) {
      			timers.splice( i--, 1 );
      		}
      	}
      
      	if ( !timers.length ) {
      		jQuery.fx.stop();
      	}
      	fxNow = undefined;
      };
      
      jQuery.fx.timer = function( timer ) {
      	if ( timer() && jQuery.timers.push( timer ) ) {
      		jQuery.fx.start();
      	}
      };
      
      jQuery.fx.interval = 13;
      
      jQuery.fx.start = function() {
      	if ( !timerId ) {
      		timerId = setInterval( jQuery.fx.tick, jQuery.fx.interval );
      	}
      };
      
      jQuery.fx.stop = function() {
      	clearInterval( timerId );
      	timerId = null;
      };
      
      jQuery.fx.speeds = {
      	slow: 600,
      	fast: 200,
      	// Default speed
      	_default: 400
      };
      
      // Back Compat <1.8 extension point
      jQuery.fx.step = {};
      
      if ( jQuery.expr && jQuery.expr.filters ) {
      	jQuery.expr.filters.animated = function( elem ) {
      		return jQuery.grep(jQuery.timers, function( fn ) {
      			return elem === fn.elem;
      		}).length;
      	};
      }
      jQuery.fn.offset = function( options ) {
      	if ( arguments.length ) {
      		return options === undefined ?
      			this :
      			this.each(function( i ) {
      				jQuery.offset.setOffset( this, options, i );
      			});
      	}
      
      	var docElem, win,
      		elem = this[ 0 ],
      		box = { top: 0, left: 0 },
      		doc = elem && elem.ownerDocument;
      
      	if ( !doc ) {
      		return;
      	}
      
      	docElem = doc.documentElement;
      
      	// Make sure it's not a disconnected DOM node
      	if ( !jQuery.contains( docElem, elem ) ) {
      		return box;
      	}
      
      	// If we don't have gBCR, just use 0,0 rather than error
      	// BlackBerry 5, iOS 3 (original iPhone)
      	if ( typeof elem.getBoundingClientRect !== core_strundefined ) {
      		box = elem.getBoundingClientRect();
      	}
      	win = getWindow( doc );
      	return {
      		top: box.top + win.pageYOffset - docElem.clientTop,
      		left: box.left + win.pageXOffset - docElem.clientLeft
      	};
      };
      
      jQuery.offset = {
      
      	setOffset: function( elem, options, i ) {
      		var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
      			position = jQuery.css( elem, "position" ),
      			curElem = jQuery( elem ),
      			props = {};
      
      		// Set position first, in-case top/left are set even on static elem
      		if ( position === "static" ) {
      			elem.style.position = "relative";
      		}
      
      		curOffset = curElem.offset();
      		curCSSTop = jQuery.css( elem, "top" );
      		curCSSLeft = jQuery.css( elem, "left" );
      		calculatePosition = ( position === "absolute" || position === "fixed" ) && ( curCSSTop + curCSSLeft ).indexOf("auto") > -1;
      
      		// Need to be able to calculate position if either top or left is auto and position is either absolute or fixed
      		if ( calculatePosition ) {
      			curPosition = curElem.position();
      			curTop = curPosition.top;
      			curLeft = curPosition.left;
      
      		} else {
      			curTop = parseFloat( curCSSTop ) || 0;
      			curLeft = parseFloat( curCSSLeft ) || 0;
      		}
      
      		if ( jQuery.isFunction( options ) ) {
      			options = options.call( elem, i, curOffset );
      		}
      
      		if ( options.top != null ) {
      			props.top = ( options.top - curOffset.top ) + curTop;
      		}
      		if ( options.left != null ) {
      			props.left = ( options.left - curOffset.left ) + curLeft;
      		}
      
      		if ( "using" in options ) {
      			options.using.call( elem, props );
      
      		} else {
      			curElem.css( props );
      		}
      	}
      };
      
      
      jQuery.fn.extend({
      
      	position: function() {
      		if ( !this[ 0 ] ) {
      			return;
      		}
      
      		var offsetParent, offset,
      			elem = this[ 0 ],
      			parentOffset = { top: 0, left: 0 };
      
      		// Fixed elements are offset from window (parentOffset = {top:0, left: 0}, because it is it's only offset parent
      		if ( jQuery.css( elem, "position" ) === "fixed" ) {
      			// We assume that getBoundingClientRect is available when computed position is fixed
      			offset = elem.getBoundingClientRect();
      
      		} else {
      			// Get *real* offsetParent
      			offsetParent = this.offsetParent();
      
      			// Get correct offsets
      			offset = this.offset();
      			if ( !jQuery.nodeName( offsetParent[ 0 ], "html" ) ) {
      				parentOffset = offsetParent.offset();
      			}
      
      			// Add offsetParent borders
      			parentOffset.top += jQuery.css( offsetParent[ 0 ], "borderTopWidth", true );
      			parentOffset.left += jQuery.css( offsetParent[ 0 ], "borderLeftWidth", true );
      		}
      
      		// Subtract parent offsets and element margins
      		return {
      			top: offset.top - parentOffset.top - jQuery.css( elem, "marginTop", true ),
      			left: offset.left - parentOffset.left - jQuery.css( elem, "marginLeft", true )
      		};
      	},
      
      	offsetParent: function() {
      		return this.map(function() {
      			var offsetParent = this.offsetParent || docElem;
      
      			while ( offsetParent && ( !jQuery.nodeName( offsetParent, "html" ) && jQuery.css( offsetParent, "position") === "static" ) ) {
      				offsetParent = offsetParent.offsetParent;
      			}
      
      			return offsetParent || docElem;
      		});
      	}
      });
      
      
      // Create scrollLeft and scrollTop methods
      jQuery.each( {scrollLeft: "pageXOffset", scrollTop: "pageYOffset"}, function( method, prop ) {
      	var top = "pageYOffset" === prop;
      
      	jQuery.fn[ method ] = function( val ) {
      		return jQuery.access( this, function( elem, method, val ) {
      			var win = getWindow( elem );
      
      			if ( val === undefined ) {
      				return win ? win[ prop ] : elem[ method ];
      			}
      
      			if ( win ) {
      				win.scrollTo(
      					!top ? val : window.pageXOffset,
      					top ? val : window.pageYOffset
      				);
      
      			} else {
      				elem[ method ] = val;
      			}
      		}, method, val, arguments.length, null );
      	};
      });
      
      function getWindow( elem ) {
      	return jQuery.isWindow( elem ) ? elem : elem.nodeType === 9 && elem.defaultView;
      }
      // Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
      jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
      	jQuery.each( { padding: "inner" + name, content: type, "": "outer" + name }, function( defaultExtra, funcName ) {
      		// margin is only for outerHeight, outerWidth
      		jQuery.fn[ funcName ] = function( margin, value ) {
      			var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
      				extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );
      
      			return jQuery.access( this, function( elem, type, value ) {
      				var doc;
      
      				if ( jQuery.isWindow( elem ) ) {
      					// As of 5/8/2012 this will yield incorrect results for Mobile Safari, but there
      					// isn't a whole lot we can do. See pull request at this URL for discussion:
      					// https://github.com/jquery/jquery/pull/764
      					return elem.document.documentElement[ "client" + name ];
      				}
      
      				// Get document width or height
      				if ( elem.nodeType === 9 ) {
      					doc = elem.documentElement;
      
      					// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
      					// whichever is greatest
      					return Math.max(
      						elem.body[ "scroll" + name ], doc[ "scroll" + name ],
      						elem.body[ "offset" + name ], doc[ "offset" + name ],
      						doc[ "client" + name ]
      					);
      				}
      
      				return value === undefined ?
      					// Get width or height on the element, requesting but not forcing parseFloat
      					jQuery.css( elem, type, extra ) :
      
      					// Set width or height on the element
      					jQuery.style( elem, type, value, extra );
      			}, type, chainable ? margin : undefined, chainable, null );
      		};
      	});
      });
      // Limit scope pollution from any deprecated API
      // (function() {
      
      // The number of elements contained in the matched element set
      jQuery.fn.size = function() {
      	return this.length;
      };
      
      jQuery.fn.andSelf = jQuery.fn.addBack;
      
      // })();
      if ( typeof module === "object" && module && typeof module.exports === "object" ) {
      	// Expose jQuery as module.exports in loaders that implement the Node
      	// module pattern (including browserify). Do not create the global, since
      	// the user will be storing it themselves locally, and globals are frowned
      	// upon in the Node module world.
      	module.exports = jQuery;
      } else {
      	// Register as a named AMD module, since jQuery can be concatenated with other
      	// files that may use define, but not via a proper concatenation script that
      	// understands anonymous AMD modules. A named AMD is safest and most robust
      	// way to register. Lowercase jquery is used because AMD module names are
      	// derived from file names, and jQuery is normally delivered in a lowercase
      	// file name. Do this after creating the global so that if an AMD module wants
      	// to call noConflict to hide this version of jQuery, it will work.
      	if ( typeof define === "function" && define.amd ) {
      		define( "jquery", [], function () { return jQuery; } );
      	}
      }
      
      // If there is a window object, that at least has a document property,
      // define jQuery and $ identifiers
      if ( typeof window === "object" && typeof window.document === "object" ) {
      	window.jQuery = window.$ = jQuery;
      }
      
      })( window );
      
      module.exports = window.jQuery;
      ;
      }
    ], [
      {
        /*
          /home/stayrad/Projects/Groovy/app/source/js/client.coffee
        */

        'base': 2,
        'when': 15,
        './settings': 16,
        './lib/socket.io': 17
      }, function(require, module, exports) {
        var Base, METHODS, Promise, SocketIo, method, settings, _i, _len, _results;
        Base = require('base');
        Promise = require('when');
        settings = require('./settings');
        SocketIo = require('./lib/socket.io');
        METHODS = ['getSongInfo', 'getSearchResults', 'getArtistsSongs', 'getAlbumSongs', 'getPlaylistSongs', 'getPlaylistByID', 'albumGetAllSongs', 'userGetSongsInLibrary', 'getFavorites', 'getPopularSongs', 'markSongAsDownloaded', 'markStreamKeyOver30Seconds', 'markSongComplete', 'authenticateUser', 'logoutUser', 'initiateQueue', 'createPlaylist', 'playlistAddSongToExisting', 'userAddSongsToLibrary', 'favorite', 'userGetPlaylists', 'getSongUrl', 'getSongStream'];
        module.exports = (function() {
          function exports() {
            this._callMethod = __bind(this._callMethod, this);
            var _this = this;
            this.socket = SocketIo.connect("http://" + settings.host + ":" + settings.port);
            this.vent = new Base.Event();
            this.socket.on('result', function(_arg) {
              var data, method;
              method = _arg[0], data = _arg[1];
              return _this.vent.trigger('result', method, data);
            });
          }

          exports.prototype._callMethod = function(method, args) {
            return this.socket.emit('call', [method, args]);
          };

          return exports;

        })();
        _results = [];
        for (_i = 0, _len = METHODS.length; _i < _len; _i++) {
          method = METHODS[_i];
          _results.push((function(method) {
            return module.exports.prototype[method] = function() {
              var args;
              args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
              return this._callMethod(method, args);
            };
          })(method));
        }
        return _results;
      }
    ], [
      {
        /*
          /home/stayrad/Projects/Groovy/node_modules/when/when.js
        */

      }, function(require, module, exports) {
        /** @license MIT License (c) copyright 2011-2013 original author or authors */
      
      /**
       * A lightweight CommonJS Promises/A and when() implementation
       * when is part of the cujo.js family of libraries (http://cujojs.com/)
       *
       * Licensed under the MIT License at:
       * http://www.opensource.org/licenses/mit-license.php
       *
       * @author Brian Cavalier
       * @author John Hann
       * @version 2.4.0
       */
      (function(define, global) { 'use strict';
      define(function (require) {
      
      	// Public API
      
      	when.promise   = promise;    // Create a pending promise
      	when.resolve   = resolve;    // Create a resolved promise
      	when.reject    = reject;     // Create a rejected promise
      	when.defer     = defer;      // Create a {promise, resolver} pair
      
      	when.join      = join;       // Join 2 or more promises
      
      	when.all       = all;        // Resolve a list of promises
      	when.map       = map;        // Array.map() for promises
      	when.reduce    = reduce;     // Array.reduce() for promises
      	when.settle    = settle;     // Settle a list of promises
      
      	when.any       = any;        // One-winner race
      	when.some      = some;       // Multi-winner race
      
      	when.isPromise = isPromiseLike;  // DEPRECATED: use isPromiseLike
      	when.isPromiseLike = isPromiseLike; // Is something promise-like, aka thenable
      
      	/**
      	 * Register an observer for a promise or immediate value.
      	 *
      	 * @param {*} promiseOrValue
      	 * @param {function?} [onFulfilled] callback to be called when promiseOrValue is
      	 *   successfully fulfilled.  If promiseOrValue is an immediate value, callback
      	 *   will be invoked immediately.
      	 * @param {function?} [onRejected] callback to be called when promiseOrValue is
      	 *   rejected.
      	 * @param {function?} [onProgress] callback to be called when progress updates
      	 *   are issued for promiseOrValue.
      	 * @returns {Promise} a new {@link Promise} that will complete with the return
      	 *   value of callback or errback or the completion value of promiseOrValue if
      	 *   callback and/or errback is not supplied.
      	 */
      	function when(promiseOrValue, onFulfilled, onRejected, onProgress) {
      		// Get a trusted promise for the input promiseOrValue, and then
      		// register promise handlers
      		return resolve(promiseOrValue).then(onFulfilled, onRejected, onProgress);
      	}
      
      	/**
      	 * Trusted Promise constructor.  A Promise created from this constructor is
      	 * a trusted when.js promise.  Any other duck-typed promise is considered
      	 * untrusted.
      	 * @constructor
      	 * @param {function} sendMessage function to deliver messages to the promise's handler
      	 * @param {function?} inspect function that reports the promise's state
      	 * @name Promise
      	 */
      	function Promise(sendMessage, inspect) {
      		this._message = sendMessage;
      		this.inspect = inspect;
      	}
      
      	Promise.prototype = {
      		/**
      		 * Register handlers for this promise.
      		 * @param [onFulfilled] {Function} fulfillment handler
      		 * @param [onRejected] {Function} rejection handler
      		 * @param [onProgress] {Function} progress handler
      		 * @return {Promise} new Promise
      		 */
      		then: function(onFulfilled, onRejected, onProgress) {
      			/*jshint unused:false*/
      			var args, sendMessage;
      
      			args = arguments;
      			sendMessage = this._message;
      
      			return _promise(function(resolve, reject, notify) {
      				sendMessage('when', args, resolve, notify);
      			}, this._status && this._status.observed());
      		},
      
      		/**
      		 * Register a rejection handler.  Shortcut for .then(undefined, onRejected)
      		 * @param {function?} onRejected
      		 * @return {Promise}
      		 */
      		otherwise: function(onRejected) {
      			return this.then(undef, onRejected);
      		},
      
      		/**
      		 * Ensures that onFulfilledOrRejected will be called regardless of whether
      		 * this promise is fulfilled or rejected.  onFulfilledOrRejected WILL NOT
      		 * receive the promises' value or reason.  Any returned value will be disregarded.
      		 * onFulfilledOrRejected may throw or return a rejected promise to signal
      		 * an additional error.
      		 * @param {function} onFulfilledOrRejected handler to be called regardless of
      		 *  fulfillment or rejection
      		 * @returns {Promise}
      		 */
      		ensure: function(onFulfilledOrRejected) {
      			return this.then(injectHandler, injectHandler)['yield'](this);
      
      			function injectHandler() {
      				return resolve(onFulfilledOrRejected());
      			}
      		},
      
      		/**
      		 * Shortcut for .then(function() { return value; })
      		 * @param  {*} value
      		 * @return {Promise} a promise that:
      		 *  - is fulfilled if value is not a promise, or
      		 *  - if value is a promise, will fulfill with its value, or reject
      		 *    with its reason.
      		 */
      		'yield': function(value) {
      			return this.then(function() {
      				return value;
      			});
      		},
      
      		/**
      		 * Runs a side effect when this promise fulfills, without changing the
      		 * fulfillment value.
      		 * @param {function} onFulfilledSideEffect
      		 * @returns {Promise}
      		 */
      		tap: function(onFulfilledSideEffect) {
      			return this.then(onFulfilledSideEffect)['yield'](this);
      		},
      
      		/**
      		 * Assumes that this promise will fulfill with an array, and arranges
      		 * for the onFulfilled to be called with the array as its argument list
      		 * i.e. onFulfilled.apply(undefined, array).
      		 * @param {function} onFulfilled function to receive spread arguments
      		 * @return {Promise}
      		 */
      		spread: function(onFulfilled) {
      			return this.then(function(array) {
      				// array may contain promises, so resolve its contents.
      				return all(array, function(array) {
      					return onFulfilled.apply(undef, array);
      				});
      			});
      		},
      
      		/**
      		 * Shortcut for .then(onFulfilledOrRejected, onFulfilledOrRejected)
      		 * @deprecated
      		 */
      		always: function(onFulfilledOrRejected, onProgress) {
      			return this.then(onFulfilledOrRejected, onFulfilledOrRejected, onProgress);
      		}
      	};
      
      	/**
      	 * Returns a resolved promise. The returned promise will be
      	 *  - fulfilled with promiseOrValue if it is a value, or
      	 *  - if promiseOrValue is a promise
      	 *    - fulfilled with promiseOrValue's value after it is fulfilled
      	 *    - rejected with promiseOrValue's reason after it is rejected
      	 * @param  {*} value
      	 * @return {Promise}
      	 */
      	function resolve(value) {
      		return promise(function(resolve) {
      			resolve(value);
      		});
      	}
      
      	/**
      	 * Returns a rejected promise for the supplied promiseOrValue.  The returned
      	 * promise will be rejected with:
      	 * - promiseOrValue, if it is a value, or
      	 * - if promiseOrValue is a promise
      	 *   - promiseOrValue's value after it is fulfilled
      	 *   - promiseOrValue's reason after it is rejected
      	 * @param {*} promiseOrValue the rejected value of the returned {@link Promise}
      	 * @return {Promise} rejected {@link Promise}
      	 */
      	function reject(promiseOrValue) {
      		return when(promiseOrValue, rejected);
      	}
      
      	/**
      	 * Creates a {promise, resolver} pair, either or both of which
      	 * may be given out safely to consumers.
      	 * The resolver has resolve, reject, and progress.  The promise
      	 * has then plus extended promise API.
      	 *
      	 * @return {{
      	 * promise: Promise,
      	 * resolve: function:Promise,
      	 * reject: function:Promise,
      	 * notify: function:Promise
      	 * resolver: {
      	 *	resolve: function:Promise,
      	 *	reject: function:Promise,
      	 *	notify: function:Promise
      	 * }}}
      	 */
      	function defer() {
      		var deferred, pending, resolved;
      
      		// Optimize object shape
      		deferred = {
      			promise: undef, resolve: undef, reject: undef, notify: undef,
      			resolver: { resolve: undef, reject: undef, notify: undef }
      		};
      
      		deferred.promise = pending = promise(makeDeferred);
      
      		return deferred;
      
      		function makeDeferred(resolvePending, rejectPending, notifyPending) {
      			deferred.resolve = deferred.resolver.resolve = function(value) {
      				if(resolved) {
      					return resolve(value);
      				}
      				resolved = true;
      				resolvePending(value);
      				return pending;
      			};
      
      			deferred.reject  = deferred.resolver.reject  = function(reason) {
      				if(resolved) {
      					return resolve(rejected(reason));
      				}
      				resolved = true;
      				rejectPending(reason);
      				return pending;
      			};
      
      			deferred.notify  = deferred.resolver.notify  = function(update) {
      				notifyPending(update);
      				return update;
      			};
      		}
      	}
      
      	/**
      	 * Creates a new promise whose fate is determined by resolver.
      	 * @param {function} resolver function(resolve, reject, notify)
      	 * @returns {Promise} promise whose fate is determine by resolver
      	 */
      	function promise(resolver) {
      		return _promise(resolver, monitorApi.PromiseStatus && monitorApi.PromiseStatus());
      	}
      
      	/**
      	 * Creates a new promise, linked to parent, whose fate is determined
      	 * by resolver.
      	 * @param {function} resolver function(resolve, reject, notify)
      	 * @param {Promise?} status promise from which the new promise is begotten
      	 * @returns {Promise} promise whose fate is determine by resolver
      	 * @private
      	 */
      	function _promise(resolver, status) {
      		var self, value, consumers = [];
      
      		self = new Promise(_message, inspect);
      		self._status = status;
      
      		// Call the provider resolver to seal the promise's fate
      		try {
      			resolver(promiseResolve, promiseReject, promiseNotify);
      		} catch(e) {
      			promiseReject(e);
      		}
      
      		// Return the promise
      		return self;
      
      		/**
      		 * Private message delivery. Queues and delivers messages to
      		 * the promise's ultimate fulfillment value or rejection reason.
      		 * @private
      		 * @param {String} type
      		 * @param {Array} args
      		 * @param {Function} resolve
      		 * @param {Function} notify
      		 */
      		function _message(type, args, resolve, notify) {
      			consumers ? consumers.push(deliver) : enqueue(function() { deliver(value); });
      
      			function deliver(p) {
      				p._message(type, args, resolve, notify);
      			}
      		}
      
      		/**
      		 * Returns a snapshot of the promise's state at the instant inspect()
      		 * is called. The returned object is not live and will not update as
      		 * the promise's state changes.
      		 * @returns {{ state:String, value?:*, reason?:* }} status snapshot
      		 *  of the promise.
      		 */
      		function inspect() {
      			return value ? value.inspect() : toPendingState();
      		}
      
      		/**
      		 * Transition from pre-resolution state to post-resolution state, notifying
      		 * all listeners of the ultimate fulfillment or rejection
      		 * @param {*|Promise} val resolution value
      		 */
      		function promiseResolve(val) {
      			if(!consumers) {
      				return;
      			}
      
      			value = coerce(val);
      			scheduleConsumers(consumers, value);
      			consumers = undef;
      
      			if(status) {
      				updateStatus(value, status);
      			}
      		}
      
      		/**
      		 * Reject this promise with the supplied reason, which will be used verbatim.
      		 * @param {*} reason reason for the rejection
      		 */
      		function promiseReject(reason) {
      			promiseResolve(rejected(reason));
      		}
      
      		/**
      		 * Issue a progress event, notifying all progress listeners
      		 * @param {*} update progress event payload to pass to all listeners
      		 */
      		function promiseNotify(update) {
      			if(consumers) {
      				scheduleConsumers(consumers, progressed(update));
      			}
      		}
      	}
      
      	/**
      	 * Creates a fulfilled, local promise as a proxy for a value
      	 * NOTE: must never be exposed
      	 * @param {*} value fulfillment value
      	 * @returns {Promise}
      	 */
      	function fulfilled(value) {
      		return near(
      			new NearFulfilledProxy(value),
      			function() { return toFulfilledState(value); }
      		);
      	}
      
      	/**
      	 * Creates a rejected, local promise with the supplied reason
      	 * NOTE: must never be exposed
      	 * @param {*} reason rejection reason
      	 * @returns {Promise}
      	 */
      	function rejected(reason) {
      		return near(
      			new NearRejectedProxy(reason),
      			function() { return toRejectedState(reason); }
      		);
      	}
      
      	/**
      	 * Creates a near promise using the provided proxy
      	 * NOTE: must never be exposed
      	 * @param {object} proxy proxy for the promise's ultimate value or reason
      	 * @param {function} inspect function that returns a snapshot of the
      	 *  returned near promise's state
      	 * @returns {Promise}
      	 */
      	function near(proxy, inspect) {
      		return new Promise(function (type, args, resolve) {
      			try {
      				resolve(proxy[type].apply(proxy, args));
      			} catch(e) {
      				resolve(rejected(e));
      			}
      		}, inspect);
      	}
      
      	/**
      	 * Create a progress promise with the supplied update.
      	 * @private
      	 * @param {*} update
      	 * @return {Promise} progress promise
      	 */
      	function progressed(update) {
      		return new Promise(function (type, args, _, notify) {
      			var onProgress = args[2];
      			try {
      				notify(typeof onProgress === 'function' ? onProgress(update) : update);
      			} catch(e) {
      				notify(e);
      			}
      		});
      	}
      
      	/**
      	 * Coerces x to a trusted Promise
      	 *
      	 * @private
      	 * @param {*} x thing to coerce
      	 * @returns {*} Guaranteed to return a trusted Promise.  If x
      	 *   is trusted, returns x, otherwise, returns a new, trusted, already-resolved
      	 *   Promise whose resolution value is:
      	 *   * the resolution value of x if it's a foreign promise, or
      	 *   * x if it's a value
      	 */
      	function coerce(x) {
      		if (x instanceof Promise) {
      			return x;
      		}
      
      		if (!(x === Object(x) && 'then' in x)) {
      			return fulfilled(x);
      		}
      
      		return promise(function(resolve, reject, notify) {
      			enqueue(function() {
      				try {
      					// We must check and assimilate in the same tick, but not the
      					// current tick, careful only to access promiseOrValue.then once.
      					var untrustedThen = x.then;
      
      					if(typeof untrustedThen === 'function') {
      						fcall(untrustedThen, x, resolve, reject, notify);
      					} else {
      						// It's a value, create a fulfilled wrapper
      						resolve(fulfilled(x));
      					}
      
      				} catch(e) {
      					// Something went wrong, reject
      					reject(e);
      				}
      			});
      		});
      	}
      
      	/**
      	 * Proxy for a near, fulfilled value
      	 * @param {*} value
      	 * @constructor
      	 */
      	function NearFulfilledProxy(value) {
      		this.value = value;
      	}
      
      	NearFulfilledProxy.prototype.when = function(onResult) {
      		return typeof onResult === 'function' ? onResult(this.value) : this.value;
      	};
      
      	/**
      	 * Proxy for a near rejection
      	 * @param {*} reason
      	 * @constructor
      	 */
      	function NearRejectedProxy(reason) {
      		this.reason = reason;
      	}
      
      	NearRejectedProxy.prototype.when = function(_, onError) {
      		if(typeof onError === 'function') {
      			return onError(this.reason);
      		} else {
      			throw this.reason;
      		}
      	};
      
      	/**
      	 * Schedule a task that will process a list of handlers
      	 * in the next queue drain run.
      	 * @private
      	 * @param {Array} handlers queue of handlers to execute
      	 * @param {*} value passed as the only arg to each handler
      	 */
      	function scheduleConsumers(handlers, value) {
      		enqueue(function() {
      			var handler, i = 0;
      			while (handler = handlers[i++]) {
      				handler(value);
      			}
      		});
      	}
      
      	function updateStatus(value, status) {
      		value.then(statusFulfilled, statusRejected);
      
      		function statusFulfilled() { status.fulfilled(); }
      		function statusRejected(r) { status.rejected(r); }
      	}
      
      	/**
      	 * Determines if x is promise-like, i.e. a thenable object
      	 * NOTE: Will return true for *any thenable object*, and isn't truly
      	 * safe, since it may attempt to access the `then` property of x (i.e.
      	 *  clever/malicious getters may do weird things)
      	 * @param {*} x anything
      	 * @returns {boolean} true if x is promise-like
      	 */
      	function isPromiseLike(x) {
      		return x && typeof x.then === 'function';
      	}
      
      	/**
      	 * Initiates a competitive race, returning a promise that will resolve when
      	 * howMany of the supplied promisesOrValues have resolved, or will reject when
      	 * it becomes impossible for howMany to resolve, for example, when
      	 * (promisesOrValues.length - howMany) + 1 input promises reject.
      	 *
      	 * @param {Array} promisesOrValues array of anything, may contain a mix
      	 *      of promises and values
      	 * @param howMany {number} number of promisesOrValues to resolve
      	 * @param {function?} [onFulfilled] DEPRECATED, use returnedPromise.then()
      	 * @param {function?} [onRejected] DEPRECATED, use returnedPromise.then()
      	 * @param {function?} [onProgress] DEPRECATED, use returnedPromise.then()
      	 * @returns {Promise} promise that will resolve to an array of howMany values that
      	 *  resolved first, or will reject with an array of
      	 *  (promisesOrValues.length - howMany) + 1 rejection reasons.
      	 */
      	function some(promisesOrValues, howMany, onFulfilled, onRejected, onProgress) {
      
      		return when(promisesOrValues, function(promisesOrValues) {
      
      			return promise(resolveSome).then(onFulfilled, onRejected, onProgress);
      
      			function resolveSome(resolve, reject, notify) {
      				var toResolve, toReject, values, reasons, fulfillOne, rejectOne, len, i;
      
      				len = promisesOrValues.length >>> 0;
      
      				toResolve = Math.max(0, Math.min(howMany, len));
      				values = [];
      
      				toReject = (len - toResolve) + 1;
      				reasons = [];
      
      				// No items in the input, resolve immediately
      				if (!toResolve) {
      					resolve(values);
      
      				} else {
      					rejectOne = function(reason) {
      						reasons.push(reason);
      						if(!--toReject) {
      							fulfillOne = rejectOne = identity;
      							reject(reasons);
      						}
      					};
      
      					fulfillOne = function(val) {
      						// This orders the values based on promise resolution order
      						values.push(val);
      						if (!--toResolve) {
      							fulfillOne = rejectOne = identity;
      							resolve(values);
      						}
      					};
      
      					for(i = 0; i < len; ++i) {
      						if(i in promisesOrValues) {
      							when(promisesOrValues[i], fulfiller, rejecter, notify);
      						}
      					}
      				}
      
      				function rejecter(reason) {
      					rejectOne(reason);
      				}
      
      				function fulfiller(val) {
      					fulfillOne(val);
      				}
      			}
      		});
      	}
      
      	/**
      	 * Initiates a competitive race, returning a promise that will resolve when
      	 * any one of the supplied promisesOrValues has resolved or will reject when
      	 * *all* promisesOrValues have rejected.
      	 *
      	 * @param {Array|Promise} promisesOrValues array of anything, may contain a mix
      	 *      of {@link Promise}s and values
      	 * @param {function?} [onFulfilled] DEPRECATED, use returnedPromise.then()
      	 * @param {function?} [onRejected] DEPRECATED, use returnedPromise.then()
      	 * @param {function?} [onProgress] DEPRECATED, use returnedPromise.then()
      	 * @returns {Promise} promise that will resolve to the value that resolved first, or
      	 * will reject with an array of all rejected inputs.
      	 */
      	function any(promisesOrValues, onFulfilled, onRejected, onProgress) {
      
      		function unwrapSingleResult(val) {
      			return onFulfilled ? onFulfilled(val[0]) : val[0];
      		}
      
      		return some(promisesOrValues, 1, unwrapSingleResult, onRejected, onProgress);
      	}
      
      	/**
      	 * Return a promise that will resolve only once all the supplied promisesOrValues
      	 * have resolved. The resolution value of the returned promise will be an array
      	 * containing the resolution values of each of the promisesOrValues.
      	 * @memberOf when
      	 *
      	 * @param {Array|Promise} promisesOrValues array of anything, may contain a mix
      	 *      of {@link Promise}s and values
      	 * @param {function?} [onFulfilled] DEPRECATED, use returnedPromise.then()
      	 * @param {function?} [onRejected] DEPRECATED, use returnedPromise.then()
      	 * @param {function?} [onProgress] DEPRECATED, use returnedPromise.then()
      	 * @returns {Promise}
      	 */
      	function all(promisesOrValues, onFulfilled, onRejected, onProgress) {
      		return _map(promisesOrValues, identity).then(onFulfilled, onRejected, onProgress);
      	}
      
      	/**
      	 * Joins multiple promises into a single returned promise.
      	 * @return {Promise} a promise that will fulfill when *all* the input promises
      	 * have fulfilled, or will reject when *any one* of the input promises rejects.
      	 */
      	function join(/* ...promises */) {
      		return _map(arguments, identity);
      	}
      
      	/**
      	 * Settles all input promises such that they are guaranteed not to
      	 * be pending once the returned promise fulfills. The returned promise
      	 * will always fulfill, except in the case where `array` is a promise
      	 * that rejects.
      	 * @param {Array|Promise} array or promise for array of promises to settle
      	 * @returns {Promise} promise that always fulfills with an array of
      	 *  outcome snapshots for each input promise.
      	 */
      	function settle(array) {
      		return _map(array, toFulfilledState, toRejectedState);
      	}
      
      	/**
      	 * Promise-aware array map function, similar to `Array.prototype.map()`,
      	 * but input array may contain promises or values.
      	 * @param {Array|Promise} array array of anything, may contain promises and values
      	 * @param {function} mapFunc map function which may return a promise or value
      	 * @returns {Promise} promise that will fulfill with an array of mapped values
      	 *  or reject if any input promise rejects.
      	 */
      	function map(array, mapFunc) {
      		return _map(array, mapFunc);
      	}
      
      	/**
      	 * Internal map that allows a fallback to handle rejections
      	 * @param {Array|Promise} array array of anything, may contain promises and values
      	 * @param {function} mapFunc map function which may return a promise or value
      	 * @param {function?} fallback function to handle rejected promises
      	 * @returns {Promise} promise that will fulfill with an array of mapped values
      	 *  or reject if any input promise rejects.
      	 */
      	function _map(array, mapFunc, fallback) {
      		return when(array, function(array) {
      
      			return _promise(resolveMap);
      
      			function resolveMap(resolve, reject, notify) {
      				var results, len, toResolve, i;
      
      				// Since we know the resulting length, we can preallocate the results
      				// array to avoid array expansions.
      				toResolve = len = array.length >>> 0;
      				results = [];
      
      				if(!toResolve) {
      					resolve(results);
      					return;
      				}
      
      				// Since mapFunc may be async, get all invocations of it into flight
      				for(i = 0; i < len; i++) {
      					if(i in array) {
      						resolveOne(array[i], i);
      					} else {
      						--toResolve;
      					}
      				}
      
      				function resolveOne(item, i) {
      					when(item, mapFunc, fallback).then(function(mapped) {
      						results[i] = mapped;
      						notify(mapped);
      
      						if(!--toResolve) {
      							resolve(results);
      						}
      					}, reject);
      				}
      			}
      		});
      	}
      
      	/**
      	 * Traditional reduce function, similar to `Array.prototype.reduce()`, but
      	 * input may contain promises and/or values, and reduceFunc
      	 * may return either a value or a promise, *and* initialValue may
      	 * be a promise for the starting value.
      	 *
      	 * @param {Array|Promise} promise array or promise for an array of anything,
      	 *      may contain a mix of promises and values.
      	 * @param {function} reduceFunc reduce function reduce(currentValue, nextValue, index, total),
      	 *      where total is the total number of items being reduced, and will be the same
      	 *      in each call to reduceFunc.
      	 * @returns {Promise} that will resolve to the final reduced value
      	 */
      	function reduce(promise, reduceFunc /*, initialValue */) {
      		var args = fcall(slice, arguments, 1);
      
      		return when(promise, function(array) {
      			var total;
      
      			total = array.length;
      
      			// Wrap the supplied reduceFunc with one that handles promises and then
      			// delegates to the supplied.
      			args[0] = function (current, val, i) {
      				return when(current, function (c) {
      					return when(val, function (value) {
      						return reduceFunc(c, value, i, total);
      					});
      				});
      			};
      
      			return reduceArray.apply(array, args);
      		});
      	}
      
      	// Snapshot states
      
      	/**
      	 * Creates a fulfilled state snapshot
      	 * @private
      	 * @param {*} x any value
      	 * @returns {{state:'fulfilled',value:*}}
      	 */
      	function toFulfilledState(x) {
      		return { state: 'fulfilled', value: x };
      	}
      
      	/**
      	 * Creates a rejected state snapshot
      	 * @private
      	 * @param {*} x any reason
      	 * @returns {{state:'rejected',reason:*}}
      	 */
      	function toRejectedState(x) {
      		return { state: 'rejected', reason: x };
      	}
      
      	/**
      	 * Creates a pending state snapshot
      	 * @private
      	 * @returns {{state:'pending'}}
      	 */
      	function toPendingState() {
      		return { state: 'pending' };
      	}
      
      	//
      	// Internals, utilities, etc.
      	//
      
      	var reduceArray, slice, fcall, nextTick, handlerQueue,
      		setTimeout, funcProto, call, arrayProto, monitorApi,
      		cjsRequire, undef;
      
      	cjsRequire = require;
      
      	//
      	// Shared handler queue processing
      	//
      	// Credit to Twisol (https://github.com/Twisol) for suggesting
      	// this type of extensible queue + trampoline approach for
      	// next-tick conflation.
      
      	handlerQueue = [];
      
      	/**
      	 * Enqueue a task. If the queue is not currently scheduled to be
      	 * drained, schedule it.
      	 * @param {function} task
      	 */
      	function enqueue(task) {
      		if(handlerQueue.push(task) === 1) {
      			nextTick(drainQueue);
      		}
      	}
      
      	/**
      	 * Drain the handler queue entirely, being careful to allow the
      	 * queue to be extended while it is being processed, and to continue
      	 * processing until it is truly empty.
      	 */
      	function drainQueue() {
      		var task, i = 0;
      
      		while(task = handlerQueue[i++]) {
      			task();
      		}
      
      		handlerQueue = [];
      	}
      
      	// capture setTimeout to avoid being caught by fake timers
      	// used in time based tests
      	setTimeout = global.setTimeout;
      
      	// Allow attaching the monitor to when() if env has no console
      	monitorApi = typeof console != 'undefined' ? console : when;
      
      	// Prefer setImmediate or MessageChannel, cascade to node,
      	// vertx and finally setTimeout
      	/*global setImmediate,MessageChannel,process*/
      	if (typeof setImmediate === 'function') {
      		nextTick = setImmediate.bind(global);
      	} else if(typeof MessageChannel !== 'undefined') {
      		var channel = new MessageChannel();
      		channel.port1.onmessage = drainQueue;
      		nextTick = function() { channel.port2.postMessage(0); };
      	} else if (typeof process === 'object' && process.nextTick) {
      		nextTick = process.nextTick;
      	} else {
      		try {
      			// vert.x 1.x || 2.x
      			nextTick = cjsRequire('vertx').runOnLoop || cjsRequire('vertx').runOnContext;
      		} catch(ignore) {
      			nextTick = function(t) { setTimeout(t, 0); };
      		}
      	}
      
      	//
      	// Capture/polyfill function and array utils
      	//
      
      	// Safe function calls
      	funcProto = Function.prototype;
      	call = funcProto.call;
      	fcall = funcProto.bind
      		? call.bind(call)
      		: function(f, context) {
      			return f.apply(context, slice.call(arguments, 2));
      		};
      
      	// Safe array ops
      	arrayProto = [];
      	slice = arrayProto.slice;
      
      	// ES5 reduce implementation if native not available
      	// See: http://es5.github.com/#x15.4.4.21 as there are many
      	// specifics and edge cases.  ES5 dictates that reduce.length === 1
      	// This implementation deviates from ES5 spec in the following ways:
      	// 1. It does not check if reduceFunc is a Callable
      	reduceArray = arrayProto.reduce ||
      		function(reduceFunc /*, initialValue */) {
      			/*jshint maxcomplexity: 7*/
      			var arr, args, reduced, len, i;
      
      			i = 0;
      			arr = Object(this);
      			len = arr.length >>> 0;
      			args = arguments;
      
      			// If no initialValue, use first item of array (we know length !== 0 here)
      			// and adjust i to start at second item
      			if(args.length <= 1) {
      				// Skip to the first real element in the array
      				for(;;) {
      					if(i in arr) {
      						reduced = arr[i++];
      						break;
      					}
      
      					// If we reached the end of the array without finding any real
      					// elements, it's a TypeError
      					if(++i >= len) {
      						throw new TypeError();
      					}
      				}
      			} else {
      				// If initialValue provided, use it
      				reduced = args[1];
      			}
      
      			// Do the actual reduce
      			for(;i < len; ++i) {
      				if(i in arr) {
      					reduced = reduceFunc(reduced, arr[i], i, arr);
      				}
      			}
      
      			return reduced;
      		};
      
      	function identity(x) {
      		return x;
      	}
      
      	return when;
      });
      })(typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }, this);
      ;
      }
    ], [
      {
        /*
          /home/stayrad/Projects/Groovy/app/source/js/settings.coffee
        */

        'base': 2
      }, function(require, module, exports) {
        var Base, Settings, _ref;
        Base = require('base');
        Settings = (function(_super) {
          __extends(Settings, _super);

          function Settings() {
            _ref = Settings.__super__.constructor.apply(this, arguments);
            return _ref;
          }

          Settings.prototype.defaults = {
            'port': 8080,
            'host': 'localhost'
          };

          return Settings;

        })(Base.Model);
        return module.exports = new Settings();
      }
    ], [
      {
        /*
          /home/stayrad/Projects/Groovy/app/source/js/lib/socket.io.js
        */

      }, function(require, module, exports) {
        /*! Socket.IO.js build:0.9.16, development. Copyright(c) 2011 LearnBoost <dev@learnboost.com> MIT Licensed */
      
      var io = ('undefined' === typeof module ? {} : module.exports);
      (function() {
      
      /**
       * socket.io
       * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
       * MIT Licensed
       */
      
      (function (exports, global) {
      
        /**
         * IO namespace.
         *
         * @namespace
         */
      
        var io = exports;
      
        /**
         * Socket.IO version
         *
         * @api public
         */
      
        io.version = '0.9.16';
      
        /**
         * Protocol implemented.
         *
         * @api public
         */
      
        io.protocol = 1;
      
        /**
         * Available transports, these will be populated with the available transports
         *
         * @api public
         */
      
        io.transports = [];
      
        /**
         * Keep track of jsonp callbacks.
         *
         * @api private
         */
      
        io.j = [];
      
        /**
         * Keep track of our io.Sockets
         *
         * @api private
         */
        io.sockets = {};
      
      
        /**
         * Manages connections to hosts.
         *
         * @param {String} uri
         * @Param {Boolean} force creation of new socket (defaults to false)
         * @api public
         */
      
        io.connect = function (host, details) {
          var uri = io.util.parseUri(host)
            , uuri
            , socket;
      
          if (global && global.location) {
            uri.protocol = uri.protocol || global.location.protocol.slice(0, -1);
            uri.host = uri.host || (global.document
              ? global.document.domain : global.location.hostname);
            uri.port = uri.port || global.location.port;
          }
      
          uuri = io.util.uniqueUri(uri);
      
          var options = {
              host: uri.host
            , secure: 'https' == uri.protocol
            , port: uri.port || ('https' == uri.protocol ? 443 : 80)
            , query: uri.query || ''
          };
      
          io.util.merge(options, details);
      
          if (options['force new connection'] || !io.sockets[uuri]) {
            socket = new io.Socket(options);
          }
      
          if (!options['force new connection'] && socket) {
            io.sockets[uuri] = socket;
          }
      
          socket = socket || io.sockets[uuri];
      
          // if path is different from '' or /
          return socket.of(uri.path.length > 1 ? uri.path : '');
        };
      
      })('object' === typeof module ? module.exports : (this.io = {}), this);
      /**
       * socket.io
       * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
       * MIT Licensed
       */
      
      (function (exports, global) {
      
        /**
         * Utilities namespace.
         *
         * @namespace
         */
      
        var util = exports.util = {};
      
        /**
         * Parses an URI
         *
         * @author Steven Levithan <stevenlevithan.com> (MIT license)
         * @api public
         */
      
        var re = /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;
      
        var parts = ['source', 'protocol', 'authority', 'userInfo', 'user', 'password',
                     'host', 'port', 'relative', 'path', 'directory', 'file', 'query',
                     'anchor'];
      
        util.parseUri = function (str) {
          var m = re.exec(str || '')
            , uri = {}
            , i = 14;
      
          while (i--) {
            uri[parts[i]] = m[i] || '';
          }
      
          return uri;
        };
      
        /**
         * Produces a unique url that identifies a Socket.IO connection.
         *
         * @param {Object} uri
         * @api public
         */
      
        util.uniqueUri = function (uri) {
          var protocol = uri.protocol
            , host = uri.host
            , port = uri.port;
      
          if ('document' in global) {
            host = host || document.domain;
            port = port || (protocol == 'https'
              && document.location.protocol !== 'https:' ? 443 : document.location.port);
          } else {
            host = host || 'localhost';
      
            if (!port && protocol == 'https') {
              port = 443;
            }
          }
      
          return (protocol || 'http') + '://' + host + ':' + (port || 80);
        };
      
        /**
         * Mergest 2 query strings in to once unique query string
         *
         * @param {String} base
         * @param {String} addition
         * @api public
         */
      
        util.query = function (base, addition) {
          var query = util.chunkQuery(base || '')
            , components = [];
      
          util.merge(query, util.chunkQuery(addition || ''));
          for (var part in query) {
            if (query.hasOwnProperty(part)) {
              components.push(part + '=' + query[part]);
            }
          }
      
          return components.length ? '?' + components.join('&') : '';
        };
      
        /**
         * Transforms a querystring in to an object
         *
         * @param {String} qs
         * @api public
         */
      
        util.chunkQuery = function (qs) {
          var query = {}
            , params = qs.split('&')
            , i = 0
            , l = params.length
            , kv;
      
          for (; i < l; ++i) {
            kv = params[i].split('=');
            if (kv[0]) {
              query[kv[0]] = kv[1];
            }
          }
      
          return query;
        };
      
        /**
         * Executes the given function when the page is loaded.
         *
         *     io.util.load(function () { console.log('page loaded'); });
         *
         * @param {Function} fn
         * @api public
         */
      
        var pageLoaded = false;
      
        util.load = function (fn) {
          if ('document' in global && document.readyState === 'complete' || pageLoaded) {
            return fn();
          }
      
          util.on(global, 'load', fn, false);
        };
      
        /**
         * Adds an event.
         *
         * @api private
         */
      
        util.on = function (element, event, fn, capture) {
          if (element.attachEvent) {
            element.attachEvent('on' + event, fn);
          } else if (element.addEventListener) {
            element.addEventListener(event, fn, capture);
          }
        };
      
        /**
         * Generates the correct `XMLHttpRequest` for regular and cross domain requests.
         *
         * @param {Boolean} [xdomain] Create a request that can be used cross domain.
         * @returns {XMLHttpRequest|false} If we can create a XMLHttpRequest.
         * @api private
         */
      
        util.request = function (xdomain) {
      
          if (xdomain && 'undefined' != typeof XDomainRequest && !util.ua.hasCORS) {
            return new XDomainRequest();
          }
      
          if ('undefined' != typeof XMLHttpRequest && (!xdomain || util.ua.hasCORS)) {
            return new XMLHttpRequest();
          }
      
          if (!xdomain) {
            try {
              return new window[(['Active'].concat('Object').join('X'))]('Microsoft.XMLHTTP');
            } catch(e) { }
          }
      
          return null;
        };
      
        /**
         * XHR based transport constructor.
         *
         * @constructor
         * @api public
         */
      
        /**
         * Change the internal pageLoaded value.
         */
      
        if ('undefined' != typeof window) {
          util.load(function () {
            pageLoaded = true;
          });
        }
      
        /**
         * Defers a function to ensure a spinner is not displayed by the browser
         *
         * @param {Function} fn
         * @api public
         */
      
        util.defer = function (fn) {
          if (!util.ua.webkit || 'undefined' != typeof importScripts) {
            return fn();
          }
      
          util.load(function () {
            setTimeout(fn, 100);
          });
        };
      
        /**
         * Merges two objects.
         *
         * @api public
         */
      
        util.merge = function merge (target, additional, deep, lastseen) {
          var seen = lastseen || []
            , depth = typeof deep == 'undefined' ? 2 : deep
            , prop;
      
          for (prop in additional) {
            if (additional.hasOwnProperty(prop) && util.indexOf(seen, prop) < 0) {
              if (typeof target[prop] !== 'object' || !depth) {
                target[prop] = additional[prop];
                seen.push(additional[prop]);
              } else {
                util.merge(target[prop], additional[prop], depth - 1, seen);
              }
            }
          }
      
          return target;
        };
      
        /**
         * Merges prototypes from objects
         *
         * @api public
         */
      
        util.mixin = function (ctor, ctor2) {
          util.merge(ctor.prototype, ctor2.prototype);
        };
      
        /**
         * Shortcut for prototypical and static inheritance.
         *
         * @api private
         */
      
        util.inherit = function (ctor, ctor2) {
          function f() {};
          f.prototype = ctor2.prototype;
          ctor.prototype = new f;
        };
      
        /**
         * Checks if the given object is an Array.
         *
         *     io.util.isArray([]); // true
         *     io.util.isArray({}); // false
         *
         * @param Object obj
         * @api public
         */
      
        util.isArray = Array.isArray || function (obj) {
          return Object.prototype.toString.call(obj) === '[object Array]';
        };
      
        /**
         * Intersects values of two arrays into a third
         *
         * @api public
         */
      
        util.intersect = function (arr, arr2) {
          var ret = []
            , longest = arr.length > arr2.length ? arr : arr2
            , shortest = arr.length > arr2.length ? arr2 : arr;
      
          for (var i = 0, l = shortest.length; i < l; i++) {
            if (~util.indexOf(longest, shortest[i]))
              ret.push(shortest[i]);
          }
      
          return ret;
        };
      
        /**
         * Array indexOf compatibility.
         *
         * @see bit.ly/a5Dxa2
         * @api public
         */
      
        util.indexOf = function (arr, o, i) {
      
          for (var j = arr.length, i = i < 0 ? i + j < 0 ? 0 : i + j : i || 0;
               i < j && arr[i] !== o; i++) {}
      
          return j <= i ? -1 : i;
        };
      
        /**
         * Converts enumerables to array.
         *
         * @api public
         */
      
        util.toArray = function (enu) {
          var arr = [];
      
          for (var i = 0, l = enu.length; i < l; i++)
            arr.push(enu[i]);
      
          return arr;
        };
      
        /**
         * UA / engines detection namespace.
         *
         * @namespace
         */
      
        util.ua = {};
      
        /**
         * Whether the UA supports CORS for XHR.
         *
         * @api public
         */
      
        util.ua.hasCORS = 'undefined' != typeof XMLHttpRequest && (function () {
          try {
            var a = new XMLHttpRequest();
          } catch (e) {
            return false;
          }
      
          return a.withCredentials != undefined;
        })();
      
        /**
         * Detect webkit.
         *
         * @api public
         */
      
        util.ua.webkit = 'undefined' != typeof navigator
          && /webkit/i.test(navigator.userAgent);
      
         /**
         * Detect iPad/iPhone/iPod.
         *
         * @api public
         */
      
        util.ua.iDevice = 'undefined' != typeof navigator
            && /iPad|iPhone|iPod/i.test(navigator.userAgent);
      
      })('undefined' != typeof io ? io : module.exports, this);
      /**
       * socket.io
       * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
       * MIT Licensed
       */
      
      (function (exports, io) {
      
        /**
         * Expose constructor.
         */
      
        exports.EventEmitter = EventEmitter;
      
        /**
         * Event emitter constructor.
         *
         * @api public.
         */
      
        function EventEmitter () {};
      
        /**
         * Adds a listener
         *
         * @api public
         */
      
        EventEmitter.prototype.on = function (name, fn) {
          if (!this.$events) {
            this.$events = {};
          }
      
          if (!this.$events[name]) {
            this.$events[name] = fn;
          } else if (io.util.isArray(this.$events[name])) {
            this.$events[name].push(fn);
          } else {
            this.$events[name] = [this.$events[name], fn];
          }
      
          return this;
        };
      
        EventEmitter.prototype.addListener = EventEmitter.prototype.on;
      
        /**
         * Adds a volatile listener.
         *
         * @api public
         */
      
        EventEmitter.prototype.once = function (name, fn) {
          var self = this;
      
          function on () {
            self.removeListener(name, on);
            fn.apply(this, arguments);
          };
      
          on.listener = fn;
          this.on(name, on);
      
          return this;
        };
      
        /**
         * Removes a listener.
         *
         * @api public
         */
      
        EventEmitter.prototype.removeListener = function (name, fn) {
          if (this.$events && this.$events[name]) {
            var list = this.$events[name];
      
            if (io.util.isArray(list)) {
              var pos = -1;
      
              for (var i = 0, l = list.length; i < l; i++) {
                if (list[i] === fn || (list[i].listener && list[i].listener === fn)) {
                  pos = i;
                  break;
                }
              }
      
              if (pos < 0) {
                return this;
              }
      
              list.splice(pos, 1);
      
              if (!list.length) {
                delete this.$events[name];
              }
            } else if (list === fn || (list.listener && list.listener === fn)) {
              delete this.$events[name];
            }
          }
      
          return this;
        };
      
        /**
         * Removes all listeners for an event.
         *
         * @api public
         */
      
        EventEmitter.prototype.removeAllListeners = function (name) {
          if (name === undefined) {
            this.$events = {};
            return this;
          }
      
          if (this.$events && this.$events[name]) {
            this.$events[name] = null;
          }
      
          return this;
        };
      
        /**
         * Gets all listeners for a certain event.
         *
         * @api publci
         */
      
        EventEmitter.prototype.listeners = function (name) {
          if (!this.$events) {
            this.$events = {};
          }
      
          if (!this.$events[name]) {
            this.$events[name] = [];
          }
      
          if (!io.util.isArray(this.$events[name])) {
            this.$events[name] = [this.$events[name]];
          }
      
          return this.$events[name];
        };
      
        /**
         * Emits an event.
         *
         * @api public
         */
      
        EventEmitter.prototype.emit = function (name) {
          if (!this.$events) {
            return false;
          }
      
          var handler = this.$events[name];
      
          if (!handler) {
            return false;
          }
      
          var args = Array.prototype.slice.call(arguments, 1);
      
          if ('function' == typeof handler) {
            handler.apply(this, args);
          } else if (io.util.isArray(handler)) {
            var listeners = handler.slice();
      
            for (var i = 0, l = listeners.length; i < l; i++) {
              listeners[i].apply(this, args);
            }
          } else {
            return false;
          }
      
          return true;
        };
      
      })(
          'undefined' != typeof io ? io : module.exports
        , 'undefined' != typeof io ? io : module.parent.exports
      );
      
      /**
       * socket.io
       * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
       * MIT Licensed
       */
      
      /**
       * Based on JSON2 (http://www.JSON.org/js.html).
       */
      
      (function (exports, nativeJSON) {
        "use strict";
      
        // use native JSON if it's available
        if (nativeJSON && nativeJSON.parse){
          return exports.JSON = {
            parse: nativeJSON.parse
          , stringify: nativeJSON.stringify
          };
        }
      
        var JSON = exports.JSON = {};
      
        function f(n) {
            // Format integers to have at least two digits.
            return n < 10 ? '0' + n : n;
        }
      
        function date(d, key) {
          return isFinite(d.valueOf()) ?
              d.getUTCFullYear()     + '-' +
              f(d.getUTCMonth() + 1) + '-' +
              f(d.getUTCDate())      + 'T' +
              f(d.getUTCHours())     + ':' +
              f(d.getUTCMinutes())   + ':' +
              f(d.getUTCSeconds())   + 'Z' : null;
        };
      
        var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
            escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
            gap,
            indent,
            meta = {    // table of character substitutions
                '\b': '\\b',
                '\t': '\\t',
                '\n': '\\n',
                '\f': '\\f',
                '\r': '\\r',
                '"' : '\\"',
                '\\': '\\\\'
            },
            rep;
      
      
        function quote(string) {
      
      // If the string contains no control characters, no quote characters, and no
      // backslash characters, then we can safely slap some quotes around it.
      // Otherwise we must also replace the offending characters with safe escape
      // sequences.
      
            escapable.lastIndex = 0;
            return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string' ? c :
                    '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' : '"' + string + '"';
        }
      
      
        function str(key, holder) {
      
      // Produce a string from holder[key].
      
            var i,          // The loop counter.
                k,          // The member key.
                v,          // The member value.
                length,
                mind = gap,
                partial,
                value = holder[key];
      
      // If the value has a toJSON method, call it to obtain a replacement value.
      
            if (value instanceof Date) {
                value = date(key);
            }
      
      // If we were called with a replacer function, then call the replacer to
      // obtain a replacement value.
      
            if (typeof rep === 'function') {
                value = rep.call(holder, key, value);
            }
      
      // What happens next depends on the value's type.
      
            switch (typeof value) {
            case 'string':
                return quote(value);
      
            case 'number':
      
      // JSON numbers must be finite. Encode non-finite numbers as null.
      
                return isFinite(value) ? String(value) : 'null';
      
            case 'boolean':
            case 'null':
      
      // If the value is a boolean or null, convert it to a string. Note:
      // typeof null does not produce 'null'. The case is included here in
      // the remote chance that this gets fixed someday.
      
                return String(value);
      
      // If the type is 'object', we might be dealing with an object or an array or
      // null.
      
            case 'object':
      
      // Due to a specification blunder in ECMAScript, typeof null is 'object',
      // so watch out for that case.
      
                if (!value) {
                    return 'null';
                }
      
      // Make an array to hold the partial results of stringifying this object value.
      
                gap += indent;
                partial = [];
      
      // Is the value an array?
      
                if (Object.prototype.toString.apply(value) === '[object Array]') {
      
      // The value is an array. Stringify every element. Use null as a placeholder
      // for non-JSON values.
      
                    length = value.length;
                    for (i = 0; i < length; i += 1) {
                        partial[i] = str(i, value) || 'null';
                    }
      
      // Join all of the elements together, separated with commas, and wrap them in
      // brackets.
      
                    v = partial.length === 0 ? '[]' : gap ?
                        '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' :
                        '[' + partial.join(',') + ']';
                    gap = mind;
                    return v;
                }
      
      // If the replacer is an array, use it to select the members to be stringified.
      
                if (rep && typeof rep === 'object') {
                    length = rep.length;
                    for (i = 0; i < length; i += 1) {
                        if (typeof rep[i] === 'string') {
                            k = rep[i];
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                } else {
      
      // Otherwise, iterate through all of the keys in the object.
      
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                }
      
      // Join all of the member texts together, separated with commas,
      // and wrap them in braces.
      
                v = partial.length === 0 ? '{}' : gap ?
                    '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' :
                    '{' + partial.join(',') + '}';
                gap = mind;
                return v;
            }
        }
      
      // If the JSON object does not yet have a stringify method, give it one.
      
        JSON.stringify = function (value, replacer, space) {
      
      // The stringify method takes a value and an optional replacer, and an optional
      // space parameter, and returns a JSON text. The replacer can be a function
      // that can replace values, or an array of strings that will select the keys.
      // A default replacer method can be provided. Use of the space parameter can
      // produce text that is more easily readable.
      
            var i;
            gap = '';
            indent = '';
      
      // If the space parameter is a number, make an indent string containing that
      // many spaces.
      
            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }
      
      // If the space parameter is a string, it will be used as the indent string.
      
            } else if (typeof space === 'string') {
                indent = space;
            }
      
      // If there is a replacer, it must be a function or an array.
      // Otherwise, throw an error.
      
            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }
      
      // Make a fake root object containing our value under the key of ''.
      // Return the result of stringifying the value.
      
            return str('', {'': value});
        };
      
      // If the JSON object does not yet have a parse method, give it one.
      
        JSON.parse = function (text, reviver) {
        // The parse method takes a text and an optional reviver function, and returns
        // a JavaScript value if the text is a valid JSON text.
      
            var j;
      
            function walk(holder, key) {
      
        // The walk method is used to recursively walk the resulting structure so
        // that modifications can be made.
      
                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }
      
      
        // Parsing happens in four stages. In the first stage, we replace certain
        // Unicode characters with escape sequences. JavaScript handles many characters
        // incorrectly, either silently deleting them, or treating them as line endings.
      
            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }
      
        // In the second stage, we run the text against regular expressions that look
        // for non-JSON patterns. We are especially concerned with '()' and 'new'
        // because they can cause invocation, and '=' because it can cause mutation.
        // But just to be safe, we want to reject all unexpected forms.
      
        // We split the second stage into 4 regexp operations in order to work around
        // crippling inefficiencies in IE's and Safari's regexp engines. First we
        // replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
        // replace all simple value tokens with ']' characters. Third, we delete all
        // open brackets that follow a colon or comma or that begin the text. Finally,
        // we look to see that the remaining characters are only whitespace or ']' or
        // ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.
      
            if (/^[\],:{}\s]*$/
                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
      
        // In the third stage we use the eval function to compile the text into a
        // JavaScript structure. The '{' operator is subject to a syntactic ambiguity
        // in JavaScript: it can begin a block or an object literal. We wrap the text
        // in parens to eliminate the ambiguity.
      
                j = eval('(' + text + ')');
      
        // In the optional fourth stage, we recursively walk the new structure, passing
        // each name/value pair to a reviver function for possible transformation.
      
                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }
      
        // If the text is not JSON parseable, then a SyntaxError is thrown.
      
            throw new SyntaxError('JSON.parse');
        };
      
      })(
          'undefined' != typeof io ? io : module.exports
        , typeof JSON !== 'undefined' ? JSON : undefined
      );
      
      /**
       * socket.io
       * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
       * MIT Licensed
       */
      
      (function (exports, io) {
      
        /**
         * Parser namespace.
         *
         * @namespace
         */
      
        var parser = exports.parser = {};
      
        /**
         * Packet types.
         */
      
        var packets = parser.packets = [
            'disconnect'
          , 'connect'
          , 'heartbeat'
          , 'message'
          , 'json'
          , 'event'
          , 'ack'
          , 'error'
          , 'noop'
        ];
      
        /**
         * Errors reasons.
         */
      
        var reasons = parser.reasons = [
            'transport not supported'
          , 'client not handshaken'
          , 'unauthorized'
        ];
      
        /**
         * Errors advice.
         */
      
        var advice = parser.advice = [
            'reconnect'
        ];
      
        /**
         * Shortcuts.
         */
      
        var JSON = io.JSON
          , indexOf = io.util.indexOf;
      
        /**
         * Encodes a packet.
         *
         * @api private
         */
      
        parser.encodePacket = function (packet) {
          var type = indexOf(packets, packet.type)
            , id = packet.id || ''
            , endpoint = packet.endpoint || ''
            , ack = packet.ack
            , data = null;
      
          switch (packet.type) {
            case 'error':
              var reason = packet.reason ? indexOf(reasons, packet.reason) : ''
                , adv = packet.advice ? indexOf(advice, packet.advice) : '';
      
              if (reason !== '' || adv !== '')
                data = reason + (adv !== '' ? ('+' + adv) : '');
      
              break;
      
            case 'message':
              if (packet.data !== '')
                data = packet.data;
              break;
      
            case 'event':
              var ev = { name: packet.name };
      
              if (packet.args && packet.args.length) {
                ev.args = packet.args;
              }
      
              data = JSON.stringify(ev);
              break;
      
            case 'json':
              data = JSON.stringify(packet.data);
              break;
      
            case 'connect':
              if (packet.qs)
                data = packet.qs;
              break;
      
            case 'ack':
              data = packet.ackId
                + (packet.args && packet.args.length
                    ? '+' + JSON.stringify(packet.args) : '');
              break;
          }
      
          // construct packet with required fragments
          var encoded = [
              type
            , id + (ack == 'data' ? '+' : '')
            , endpoint
          ];
      
          // data fragment is optional
          if (data !== null && data !== undefined)
            encoded.push(data);
      
          return encoded.join(':');
        };
      
        /**
         * Encodes multiple messages (payload).
         *
         * @param {Array} messages
         * @api private
         */
      
        parser.encodePayload = function (packets) {
          var decoded = '';
      
          if (packets.length == 1)
            return packets[0];
      
          for (var i = 0, l = packets.length; i < l; i++) {
            var packet = packets[i];
            decoded += '\ufffd' + packet.length + '\ufffd' + packets[i];
          }
      
          return decoded;
        };
      
        /**
         * Decodes a packet
         *
         * @api private
         */
      
        var regexp = /([^:]+):([0-9]+)?(\+)?:([^:]+)?:?([\s\S]*)?/;
      
        parser.decodePacket = function (data) {
          var pieces = data.match(regexp);
      
          if (!pieces) return {};
      
          var id = pieces[2] || ''
            , data = pieces[5] || ''
            , packet = {
                  type: packets[pieces[1]]
                , endpoint: pieces[4] || ''
              };
      
          // whether we need to acknowledge the packet
          if (id) {
            packet.id = id;
            if (pieces[3])
              packet.ack = 'data';
            else
              packet.ack = true;
          }
      
          // handle different packet types
          switch (packet.type) {
            case 'error':
              var pieces = data.split('+');
              packet.reason = reasons[pieces[0]] || '';
              packet.advice = advice[pieces[1]] || '';
              break;
      
            case 'message':
              packet.data = data || '';
              break;
      
            case 'event':
              try {
                var opts = JSON.parse(data);
                packet.name = opts.name;
                packet.args = opts.args;
              } catch (e) { }
      
              packet.args = packet.args || [];
              break;
      
            case 'json':
              try {
                packet.data = JSON.parse(data);
              } catch (e) { }
              break;
      
            case 'connect':
              packet.qs = data || '';
              break;
      
            case 'ack':
              var pieces = data.match(/^([0-9]+)(\+)?(.*)/);
              if (pieces) {
                packet.ackId = pieces[1];
                packet.args = [];
      
                if (pieces[3]) {
                  try {
                    packet.args = pieces[3] ? JSON.parse(pieces[3]) : [];
                  } catch (e) { }
                }
              }
              break;
      
            case 'disconnect':
            case 'heartbeat':
              break;
          };
      
          return packet;
        };
      
        /**
         * Decodes data payload. Detects multiple messages
         *
         * @return {Array} messages
         * @api public
         */
      
        parser.decodePayload = function (data) {
          // IE doesn't like data[i] for unicode chars, charAt works fine
          if (data.charAt(0) == '\ufffd') {
            var ret = [];
      
            for (var i = 1, length = ''; i < data.length; i++) {
              if (data.charAt(i) == '\ufffd') {
                ret.push(parser.decodePacket(data.substr(i + 1).substr(0, length)));
                i += Number(length) + 1;
                length = '';
              } else {
                length += data.charAt(i);
              }
            }
      
            return ret;
          } else {
            return [parser.decodePacket(data)];
          }
        };
      
      })(
          'undefined' != typeof io ? io : module.exports
        , 'undefined' != typeof io ? io : module.parent.exports
      );
      /**
       * socket.io
       * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
       * MIT Licensed
       */
      
      (function (exports, io) {
      
        /**
         * Expose constructor.
         */
      
        exports.Transport = Transport;
      
        /**
         * This is the transport template for all supported transport methods.
         *
         * @constructor
         * @api public
         */
      
        function Transport (socket, sessid) {
          this.socket = socket;
          this.sessid = sessid;
        };
      
        /**
         * Apply EventEmitter mixin.
         */
      
        io.util.mixin(Transport, io.EventEmitter);
      
      
        /**
         * Indicates whether heartbeats is enabled for this transport
         *
         * @api private
         */
      
        Transport.prototype.heartbeats = function () {
          return true;
        };
      
        /**
         * Handles the response from the server. When a new response is received
         * it will automatically update the timeout, decode the message and
         * forwards the response to the onMessage function for further processing.
         *
         * @param {String} data Response from the server.
         * @api private
         */
      
        Transport.prototype.onData = function (data) {
          this.clearCloseTimeout();
      
          // If the connection in currently open (or in a reopening state) reset the close
          // timeout since we have just received data. This check is necessary so
          // that we don't reset the timeout on an explicitly disconnected connection.
          if (this.socket.connected || this.socket.connecting || this.socket.reconnecting) {
            this.setCloseTimeout();
          }
      
          if (data !== '') {
            // todo: we should only do decodePayload for xhr transports
            var msgs = io.parser.decodePayload(data);
      
            if (msgs && msgs.length) {
              for (var i = 0, l = msgs.length; i < l; i++) {
                this.onPacket(msgs[i]);
              }
            }
          }
      
          return this;
        };
      
        /**
         * Handles packets.
         *
         * @api private
         */
      
        Transport.prototype.onPacket = function (packet) {
          this.socket.setHeartbeatTimeout();
      
          if (packet.type == 'heartbeat') {
            return this.onHeartbeat();
          }
      
          if (packet.type == 'connect' && packet.endpoint == '') {
            this.onConnect();
          }
      
          if (packet.type == 'error' && packet.advice == 'reconnect') {
            this.isOpen = false;
          }
      
          this.socket.onPacket(packet);
      
          return this;
        };
      
        /**
         * Sets close timeout
         *
         * @api private
         */
      
        Transport.prototype.setCloseTimeout = function () {
          if (!this.closeTimeout) {
            var self = this;
      
            this.closeTimeout = setTimeout(function () {
              self.onDisconnect();
            }, this.socket.closeTimeout);
          }
        };
      
        /**
         * Called when transport disconnects.
         *
         * @api private
         */
      
        Transport.prototype.onDisconnect = function () {
          if (this.isOpen) this.close();
          this.clearTimeouts();
          this.socket.onDisconnect();
          return this;
        };
      
        /**
         * Called when transport connects
         *
         * @api private
         */
      
        Transport.prototype.onConnect = function () {
          this.socket.onConnect();
          return this;
        };
      
        /**
         * Clears close timeout
         *
         * @api private
         */
      
        Transport.prototype.clearCloseTimeout = function () {
          if (this.closeTimeout) {
            clearTimeout(this.closeTimeout);
            this.closeTimeout = null;
          }
        };
      
        /**
         * Clear timeouts
         *
         * @api private
         */
      
        Transport.prototype.clearTimeouts = function () {
          this.clearCloseTimeout();
      
          if (this.reopenTimeout) {
            clearTimeout(this.reopenTimeout);
          }
        };
      
        /**
         * Sends a packet
         *
         * @param {Object} packet object.
         * @api private
         */
      
        Transport.prototype.packet = function (packet) {
          this.send(io.parser.encodePacket(packet));
        };
      
        /**
         * Send the received heartbeat message back to server. So the server
         * knows we are still connected.
         *
         * @param {String} heartbeat Heartbeat response from the server.
         * @api private
         */
      
        Transport.prototype.onHeartbeat = function (heartbeat) {
          this.packet({ type: 'heartbeat' });
        };
      
        /**
         * Called when the transport opens.
         *
         * @api private
         */
      
        Transport.prototype.onOpen = function () {
          this.isOpen = true;
          this.clearCloseTimeout();
          this.socket.onOpen();
        };
      
        /**
         * Notifies the base when the connection with the Socket.IO server
         * has been disconnected.
         *
         * @api private
         */
      
        Transport.prototype.onClose = function () {
          var self = this;
      
          /* FIXME: reopen delay causing a infinit loop
          this.reopenTimeout = setTimeout(function () {
            self.open();
          }, this.socket.options['reopen delay']);*/
      
          this.isOpen = false;
          this.socket.onClose();
          this.onDisconnect();
        };
      
        /**
         * Generates a connection url based on the Socket.IO URL Protocol.
         * See <https://github.com/learnboost/socket.io-node/> for more details.
         *
         * @returns {String} Connection url
         * @api private
         */
      
        Transport.prototype.prepareUrl = function () {
          var options = this.socket.options;
      
          return this.scheme() + '://'
            + options.host + ':' + options.port + '/'
            + options.resource + '/' + io.protocol
            + '/' + this.name + '/' + this.sessid;
        };
      
        /**
         * Checks if the transport is ready to start a connection.
         *
         * @param {Socket} socket The socket instance that needs a transport
         * @param {Function} fn The callback
         * @api private
         */
      
        Transport.prototype.ready = function (socket, fn) {
          fn.call(this);
        };
      })(
          'undefined' != typeof io ? io : module.exports
        , 'undefined' != typeof io ? io : module.parent.exports
      );
      /**
       * socket.io
       * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
       * MIT Licensed
       */
      
      (function (exports, io, global) {
      
        /**
         * Expose constructor.
         */
      
        exports.Socket = Socket;
      
        /**
         * Create a new `Socket.IO client` which can establish a persistent
         * connection with a Socket.IO enabled server.
         *
         * @api public
         */
      
        function Socket (options) {
          this.options = {
              port: 80
            , secure: false
            , document: 'document' in global ? document : false
            , resource: 'socket.io'
            , transports: io.transports
            , 'connect timeout': 10000
            , 'try multiple transports': true
            , 'reconnect': true
            , 'reconnection delay': 500
            , 'reconnection limit': Infinity
            , 'reopen delay': 3000
            , 'max reconnection attempts': 10
            , 'sync disconnect on unload': false
            , 'auto connect': true
            , 'flash policy port': 10843
            , 'manualFlush': false
          };
      
          io.util.merge(this.options, options);
      
          this.connected = false;
          this.open = false;
          this.connecting = false;
          this.reconnecting = false;
          this.namespaces = {};
          this.buffer = [];
          this.doBuffer = false;
      
          if (this.options['sync disconnect on unload'] &&
              (!this.isXDomain() || io.util.ua.hasCORS)) {
            var self = this;
            io.util.on(global, 'beforeunload', function () {
              self.disconnectSync();
            }, false);
          }
      
          if (this.options['auto connect']) {
            this.connect();
          }
      };
      
        /**
         * Apply EventEmitter mixin.
         */
      
        io.util.mixin(Socket, io.EventEmitter);
      
        /**
         * Returns a namespace listener/emitter for this socket
         *
         * @api public
         */
      
        Socket.prototype.of = function (name) {
          if (!this.namespaces[name]) {
            this.namespaces[name] = new io.SocketNamespace(this, name);
      
            if (name !== '') {
              this.namespaces[name].packet({ type: 'connect' });
            }
          }
      
          return this.namespaces[name];
        };
      
        /**
         * Emits the given event to the Socket and all namespaces
         *
         * @api private
         */
      
        Socket.prototype.publish = function () {
          this.emit.apply(this, arguments);
      
          var nsp;
      
          for (var i in this.namespaces) {
            if (this.namespaces.hasOwnProperty(i)) {
              nsp = this.of(i);
              nsp.$emit.apply(nsp, arguments);
            }
          }
        };
      
        /**
         * Performs the handshake
         *
         * @api private
         */
      
        function empty () { };
      
        Socket.prototype.handshake = function (fn) {
          var self = this
            , options = this.options;
      
          function complete (data) {
            if (data instanceof Error) {
              self.connecting = false;
              self.onError(data.message);
            } else {
              fn.apply(null, data.split(':'));
            }
          };
      
          var url = [
                'http' + (options.secure ? 's' : '') + ':/'
              , options.host + ':' + options.port
              , options.resource
              , io.protocol
              , io.util.query(this.options.query, 't=' + +new Date)
            ].join('/');
      
          if (this.isXDomain() && !io.util.ua.hasCORS) {
            var insertAt = document.getElementsByTagName('script')[0]
              , script = document.createElement('script');
      
            script.src = url + '&jsonp=' + io.j.length;
            insertAt.parentNode.insertBefore(script, insertAt);
      
            io.j.push(function (data) {
              complete(data);
              script.parentNode.removeChild(script);
            });
          } else {
            var xhr = io.util.request();
      
            xhr.open('GET', url, true);
            if (this.isXDomain()) {
              xhr.withCredentials = true;
            }
            xhr.onreadystatechange = function () {
              if (xhr.readyState == 4) {
                xhr.onreadystatechange = empty;
      
                if (xhr.status == 200) {
                  complete(xhr.responseText);
                } else if (xhr.status == 403) {
                  self.onError(xhr.responseText);
                } else {
                  self.connecting = false;            
                  !self.reconnecting && self.onError(xhr.responseText);
                }
              }
            };
            xhr.send(null);
          }
        };
      
        /**
         * Find an available transport based on the options supplied in the constructor.
         *
         * @api private
         */
      
        Socket.prototype.getTransport = function (override) {
          var transports = override || this.transports, match;
      
          for (var i = 0, transport; transport = transports[i]; i++) {
            if (io.Transport[transport]
              && io.Transport[transport].check(this)
              && (!this.isXDomain() || io.Transport[transport].xdomainCheck(this))) {
              return new io.Transport[transport](this, this.sessionid);
            }
          }
      
          return null;
        };
      
        /**
         * Connects to the server.
         *
         * @param {Function} [fn] Callback.
         * @returns {io.Socket}
         * @api public
         */
      
        Socket.prototype.connect = function (fn) {
          if (this.connecting) {
            return this;
          }
      
          var self = this;
          self.connecting = true;
          
          this.handshake(function (sid, heartbeat, close, transports) {
            self.sessionid = sid;
            self.closeTimeout = close * 1000;
            self.heartbeatTimeout = heartbeat * 1000;
            if(!self.transports)
                self.transports = self.origTransports = (transports ? io.util.intersect(
                    transports.split(',')
                  , self.options.transports
                ) : self.options.transports);
      
            self.setHeartbeatTimeout();
      
            function connect (transports){
              if (self.transport) self.transport.clearTimeouts();
      
              self.transport = self.getTransport(transports);
              if (!self.transport) return self.publish('connect_failed');
      
              // once the transport is ready
              self.transport.ready(self, function () {
                self.connecting = true;
                self.publish('connecting', self.transport.name);
                self.transport.open();
      
                if (self.options['connect timeout']) {
                  self.connectTimeoutTimer = setTimeout(function () {
                    if (!self.connected) {
                      self.connecting = false;
      
                      if (self.options['try multiple transports']) {
                        var remaining = self.transports;
      
                        while (remaining.length > 0 && remaining.splice(0,1)[0] !=
                               self.transport.name) {}
      
                          if (remaining.length){
                            connect(remaining);
                          } else {
                            self.publish('connect_failed');
                          }
                      }
                    }
                  }, self.options['connect timeout']);
                }
              });
            }
      
            connect(self.transports);
      
            self.once('connect', function (){
              clearTimeout(self.connectTimeoutTimer);
      
              fn && typeof fn == 'function' && fn();
            });
          });
      
          return this;
        };
      
        /**
         * Clears and sets a new heartbeat timeout using the value given by the
         * server during the handshake.
         *
         * @api private
         */
      
        Socket.prototype.setHeartbeatTimeout = function () {
          clearTimeout(this.heartbeatTimeoutTimer);
          if(this.transport && !this.transport.heartbeats()) return;
      
          var self = this;
          this.heartbeatTimeoutTimer = setTimeout(function () {
            self.transport.onClose();
          }, this.heartbeatTimeout);
        };
      
        /**
         * Sends a message.
         *
         * @param {Object} data packet.
         * @returns {io.Socket}
         * @api public
         */
      
        Socket.prototype.packet = function (data) {
          if (this.connected && !this.doBuffer) {
            this.transport.packet(data);
          } else {
            this.buffer.push(data);
          }
      
          return this;
        };
      
        /**
         * Sets buffer state
         *
         * @api private
         */
      
        Socket.prototype.setBuffer = function (v) {
          this.doBuffer = v;
      
          if (!v && this.connected && this.buffer.length) {
            if (!this.options['manualFlush']) {
              this.flushBuffer();
            }
          }
        };
      
        /**
         * Flushes the buffer data over the wire.
         * To be invoked manually when 'manualFlush' is set to true.
         *
         * @api public
         */
      
        Socket.prototype.flushBuffer = function() {
          this.transport.payload(this.buffer);
          this.buffer = [];
        };
        
      
        /**
         * Disconnect the established connect.
         *
         * @returns {io.Socket}
         * @api public
         */
      
        Socket.prototype.disconnect = function () {
          if (this.connected || this.connecting) {
            if (this.open) {
              this.of('').packet({ type: 'disconnect' });
            }
      
            // handle disconnection immediately
            this.onDisconnect('booted');
          }
      
          return this;
        };
      
        /**
         * Disconnects the socket with a sync XHR.
         *
         * @api private
         */
      
        Socket.prototype.disconnectSync = function () {
          // ensure disconnection
          var xhr = io.util.request();
          var uri = [
              'http' + (this.options.secure ? 's' : '') + ':/'
            , this.options.host + ':' + this.options.port
            , this.options.resource
            , io.protocol
            , ''
            , this.sessionid
          ].join('/') + '/?disconnect=1';
      
          xhr.open('GET', uri, false);
          xhr.send(null);
      
          // handle disconnection immediately
          this.onDisconnect('booted');
        };
      
        /**
         * Check if we need to use cross domain enabled transports. Cross domain would
         * be a different port or different domain name.
         *
         * @returns {Boolean}
         * @api private
         */
      
        Socket.prototype.isXDomain = function () {
      
          var port = global.location.port ||
            ('https:' == global.location.protocol ? 443 : 80);
      
          return this.options.host !== global.location.hostname 
            || this.options.port != port;
        };
      
        /**
         * Called upon handshake.
         *
         * @api private
         */
      
        Socket.prototype.onConnect = function () {
          if (!this.connected) {
            this.connected = true;
            this.connecting = false;
            if (!this.doBuffer) {
              // make sure to flush the buffer
              this.setBuffer(false);
            }
            this.emit('connect');
          }
        };
      
        /**
         * Called when the transport opens
         *
         * @api private
         */
      
        Socket.prototype.onOpen = function () {
          this.open = true;
        };
      
        /**
         * Called when the transport closes.
         *
         * @api private
         */
      
        Socket.prototype.onClose = function () {
          this.open = false;
          clearTimeout(this.heartbeatTimeoutTimer);
        };
      
        /**
         * Called when the transport first opens a connection
         *
         * @param text
         */
      
        Socket.prototype.onPacket = function (packet) {
          this.of(packet.endpoint).onPacket(packet);
        };
      
        /**
         * Handles an error.
         *
         * @api private
         */
      
        Socket.prototype.onError = function (err) {
          if (err && err.advice) {
            if (err.advice === 'reconnect' && (this.connected || this.connecting)) {
              this.disconnect();
              if (this.options.reconnect) {
                this.reconnect();
              }
            }
          }
      
          this.publish('error', err && err.reason ? err.reason : err);
        };
      
        /**
         * Called when the transport disconnects.
         *
         * @api private
         */
      
        Socket.prototype.onDisconnect = function (reason) {
          var wasConnected = this.connected
            , wasConnecting = this.connecting;
      
          this.connected = false;
          this.connecting = false;
          this.open = false;
      
          if (wasConnected || wasConnecting) {
            this.transport.close();
            this.transport.clearTimeouts();
            if (wasConnected) {
              this.publish('disconnect', reason);
      
              if ('booted' != reason && this.options.reconnect && !this.reconnecting) {
                this.reconnect();
              }
            }
          }
        };
      
        /**
         * Called upon reconnection.
         *
         * @api private
         */
      
        Socket.prototype.reconnect = function () {
          this.reconnecting = true;
          this.reconnectionAttempts = 0;
          this.reconnectionDelay = this.options['reconnection delay'];
      
          var self = this
            , maxAttempts = this.options['max reconnection attempts']
            , tryMultiple = this.options['try multiple transports']
            , limit = this.options['reconnection limit'];
      
          function reset () {
            if (self.connected) {
              for (var i in self.namespaces) {
                if (self.namespaces.hasOwnProperty(i) && '' !== i) {
                    self.namespaces[i].packet({ type: 'connect' });
                }
              }
              self.publish('reconnect', self.transport.name, self.reconnectionAttempts);
            }
      
            clearTimeout(self.reconnectionTimer);
      
            self.removeListener('connect_failed', maybeReconnect);
            self.removeListener('connect', maybeReconnect);
      
            self.reconnecting = false;
      
            delete self.reconnectionAttempts;
            delete self.reconnectionDelay;
            delete self.reconnectionTimer;
            delete self.redoTransports;
      
            self.options['try multiple transports'] = tryMultiple;
          };
      
          function maybeReconnect () {
            if (!self.reconnecting) {
              return;
            }
      
            if (self.connected) {
              return reset();
            };
      
            if (self.connecting && self.reconnecting) {
              return self.reconnectionTimer = setTimeout(maybeReconnect, 1000);
            }
      
            if (self.reconnectionAttempts++ >= maxAttempts) {
              if (!self.redoTransports) {
                self.on('connect_failed', maybeReconnect);
                self.options['try multiple transports'] = true;
                self.transports = self.origTransports;
                self.transport = self.getTransport();
                self.redoTransports = true;
                self.connect();
              } else {
                self.publish('reconnect_failed');
                reset();
              }
            } else {
              if (self.reconnectionDelay < limit) {
                self.reconnectionDelay *= 2; // exponential back off
              }
      
              self.connect();
              self.publish('reconnecting', self.reconnectionDelay, self.reconnectionAttempts);
              self.reconnectionTimer = setTimeout(maybeReconnect, self.reconnectionDelay);
            }
          };
      
          this.options['try multiple transports'] = false;
          this.reconnectionTimer = setTimeout(maybeReconnect, this.reconnectionDelay);
      
          this.on('connect', maybeReconnect);
        };
      
      })(
          'undefined' != typeof io ? io : module.exports
        , 'undefined' != typeof io ? io : module.parent.exports
        , this
      );
      /**
       * socket.io
       * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
       * MIT Licensed
       */
      
      (function (exports, io) {
      
        /**
         * Expose constructor.
         */
      
        exports.SocketNamespace = SocketNamespace;
      
        /**
         * Socket namespace constructor.
         *
         * @constructor
         * @api public
         */
      
        function SocketNamespace (socket, name) {
          this.socket = socket;
          this.name = name || '';
          this.flags = {};
          this.json = new Flag(this, 'json');
          this.ackPackets = 0;
          this.acks = {};
        };
      
        /**
         * Apply EventEmitter mixin.
         */
      
        io.util.mixin(SocketNamespace, io.EventEmitter);
      
        /**
         * Copies emit since we override it
         *
         * @api private
         */
      
        SocketNamespace.prototype.$emit = io.EventEmitter.prototype.emit;
      
        /**
         * Creates a new namespace, by proxying the request to the socket. This
         * allows us to use the synax as we do on the server.
         *
         * @api public
         */
      
        SocketNamespace.prototype.of = function () {
          return this.socket.of.apply(this.socket, arguments);
        };
      
        /**
         * Sends a packet.
         *
         * @api private
         */
      
        SocketNamespace.prototype.packet = function (packet) {
          packet.endpoint = this.name;
          this.socket.packet(packet);
          this.flags = {};
          return this;
        };
      
        /**
         * Sends a message
         *
         * @api public
         */
      
        SocketNamespace.prototype.send = function (data, fn) {
          var packet = {
              type: this.flags.json ? 'json' : 'message'
            , data: data
          };
      
          if ('function' == typeof fn) {
            packet.id = ++this.ackPackets;
            packet.ack = true;
            this.acks[packet.id] = fn;
          }
      
          return this.packet(packet);
        };
      
        /**
         * Emits an event
         *
         * @api public
         */
        
        SocketNamespace.prototype.emit = function (name) {
          var args = Array.prototype.slice.call(arguments, 1)
            , lastArg = args[args.length - 1]
            , packet = {
                  type: 'event'
                , name: name
              };
      
          if ('function' == typeof lastArg) {
            packet.id = ++this.ackPackets;
            packet.ack = 'data';
            this.acks[packet.id] = lastArg;
            args = args.slice(0, args.length - 1);
          }
      
          packet.args = args;
      
          return this.packet(packet);
        };
      
        /**
         * Disconnects the namespace
         *
         * @api private
         */
      
        SocketNamespace.prototype.disconnect = function () {
          if (this.name === '') {
            this.socket.disconnect();
          } else {
            this.packet({ type: 'disconnect' });
            this.$emit('disconnect');
          }
      
          return this;
        };
      
        /**
         * Handles a packet
         *
         * @api private
         */
      
        SocketNamespace.prototype.onPacket = function (packet) {
          var self = this;
      
          function ack () {
            self.packet({
                type: 'ack'
              , args: io.util.toArray(arguments)
              , ackId: packet.id
            });
          };
      
          switch (packet.type) {
            case 'connect':
              this.$emit('connect');
              break;
      
            case 'disconnect':
              if (this.name === '') {
                this.socket.onDisconnect(packet.reason || 'booted');
              } else {
                this.$emit('disconnect', packet.reason);
              }
              break;
      
            case 'message':
            case 'json':
              var params = ['message', packet.data];
      
              if (packet.ack == 'data') {
                params.push(ack);
              } else if (packet.ack) {
                this.packet({ type: 'ack', ackId: packet.id });
              }
      
              this.$emit.apply(this, params);
              break;
      
            case 'event':
              var params = [packet.name].concat(packet.args);
      
              if (packet.ack == 'data')
                params.push(ack);
      
              this.$emit.apply(this, params);
              break;
      
            case 'ack':
              if (this.acks[packet.ackId]) {
                this.acks[packet.ackId].apply(this, packet.args);
                delete this.acks[packet.ackId];
              }
              break;
      
            case 'error':
              if (packet.advice){
                this.socket.onError(packet);
              } else {
                if (packet.reason == 'unauthorized') {
                  this.$emit('connect_failed', packet.reason);
                } else {
                  this.$emit('error', packet.reason);
                }
              }
              break;
          }
        };
      
        /**
         * Flag interface.
         *
         * @api private
         */
      
        function Flag (nsp, name) {
          this.namespace = nsp;
          this.name = name;
        };
      
        /**
         * Send a message
         *
         * @api public
         */
      
        Flag.prototype.send = function () {
          this.namespace.flags[this.name] = true;
          this.namespace.send.apply(this.namespace, arguments);
        };
      
        /**
         * Emit an event
         *
         * @api public
         */
      
        Flag.prototype.emit = function () {
          this.namespace.flags[this.name] = true;
          this.namespace.emit.apply(this.namespace, arguments);
        };
      
      })(
          'undefined' != typeof io ? io : module.exports
        , 'undefined' != typeof io ? io : module.parent.exports
      );
      
      /**
       * socket.io
       * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
       * MIT Licensed
       */
      
      (function (exports, io, global) {
      
        /**
         * Expose constructor.
         */
      
        exports.websocket = WS;
      
        /**
         * The WebSocket transport uses the HTML5 WebSocket API to establish an
         * persistent connection with the Socket.IO server. This transport will also
         * be inherited by the FlashSocket fallback as it provides a API compatible
         * polyfill for the WebSockets.
         *
         * @constructor
         * @extends {io.Transport}
         * @api public
         */
      
        function WS (socket) {
          io.Transport.apply(this, arguments);
        };
      
        /**
         * Inherits from Transport.
         */
      
        io.util.inherit(WS, io.Transport);
      
        /**
         * Transport name
         *
         * @api public
         */
      
        WS.prototype.name = 'websocket';
      
        /**
         * Initializes a new `WebSocket` connection with the Socket.IO server. We attach
         * all the appropriate listeners to handle the responses from the server.
         *
         * @returns {Transport}
         * @api public
         */
      
        WS.prototype.open = function () {
          var query = io.util.query(this.socket.options.query)
            , self = this
            , Socket
      
      
          if (!Socket) {
            Socket = global.MozWebSocket || global.WebSocket;
          }
      
          this.websocket = new Socket(this.prepareUrl() + query);
      
          this.websocket.onopen = function () {
            self.onOpen();
            self.socket.setBuffer(false);
          };
          this.websocket.onmessage = function (ev) {
            self.onData(ev.data);
          };
          this.websocket.onclose = function () {
            self.onClose();
            self.socket.setBuffer(true);
          };
          this.websocket.onerror = function (e) {
            self.onError(e);
          };
      
          return this;
        };
      
        /**
         * Send a message to the Socket.IO server. The message will automatically be
         * encoded in the correct message format.
         *
         * @returns {Transport}
         * @api public
         */
      
        // Do to a bug in the current IDevices browser, we need to wrap the send in a 
        // setTimeout, when they resume from sleeping the browser will crash if 
        // we don't allow the browser time to detect the socket has been closed
        if (io.util.ua.iDevice) {
          WS.prototype.send = function (data) {
            var self = this;
            setTimeout(function() {
               self.websocket.send(data);
            },0);
            return this;
          };
        } else {
          WS.prototype.send = function (data) {
            this.websocket.send(data);
            return this;
          };
        }
      
        /**
         * Payload
         *
         * @api private
         */
      
        WS.prototype.payload = function (arr) {
          for (var i = 0, l = arr.length; i < l; i++) {
            this.packet(arr[i]);
          }
          return this;
        };
      
        /**
         * Disconnect the established `WebSocket` connection.
         *
         * @returns {Transport}
         * @api public
         */
      
        WS.prototype.close = function () {
          this.websocket.close();
          return this;
        };
      
        /**
         * Handle the errors that `WebSocket` might be giving when we
         * are attempting to connect or send messages.
         *
         * @param {Error} e The error.
         * @api private
         */
      
        WS.prototype.onError = function (e) {
          this.socket.onError(e);
        };
      
        /**
         * Returns the appropriate scheme for the URI generation.
         *
         * @api private
         */
        WS.prototype.scheme = function () {
          return this.socket.options.secure ? 'wss' : 'ws';
        };
      
        /**
         * Checks if the browser has support for native `WebSockets` and that
         * it's not the polyfill created for the FlashSocket transport.
         *
         * @return {Boolean}
         * @api public
         */
      
        WS.check = function () {
          return ('WebSocket' in global && !('__addTask' in WebSocket))
                || 'MozWebSocket' in global;
        };
      
        /**
         * Check if the `WebSocket` transport support cross domain communications.
         *
         * @returns {Boolean}
         * @api public
         */
      
        WS.xdomainCheck = function () {
          return true;
        };
      
        /**
         * Add the transport to your public io.transports array.
         *
         * @api private
         */
      
        io.transports.push('websocket');
      
      })(
          'undefined' != typeof io ? io.Transport : module.exports
        , 'undefined' != typeof io ? io : module.parent.exports
        , this
      );
      
      /**
       * socket.io
       * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
       * MIT Licensed
       */
      
      (function (exports, io, global) {
      
        /**
         * Expose constructor.
         *
         * @api public
         */
      
        exports.XHR = XHR;
      
        /**
         * XHR constructor
         *
         * @costructor
         * @api public
         */
      
        function XHR (socket) {
          if (!socket) return;
      
          io.Transport.apply(this, arguments);
          this.sendBuffer = [];
        };
      
        /**
         * Inherits from Transport.
         */
      
        io.util.inherit(XHR, io.Transport);
      
        /**
         * Establish a connection
         *
         * @returns {Transport}
         * @api public
         */
      
        XHR.prototype.open = function () {
          this.socket.setBuffer(false);
          this.onOpen();
          this.get();
      
          // we need to make sure the request succeeds since we have no indication
          // whether the request opened or not until it succeeded.
          this.setCloseTimeout();
      
          return this;
        };
      
        /**
         * Check if we need to send data to the Socket.IO server, if we have data in our
         * buffer we encode it and forward it to the `post` method.
         *
         * @api private
         */
      
        XHR.prototype.payload = function (payload) {
          var msgs = [];
      
          for (var i = 0, l = payload.length; i < l; i++) {
            msgs.push(io.parser.encodePacket(payload[i]));
          }
      
          this.send(io.parser.encodePayload(msgs));
        };
      
        /**
         * Send data to the Socket.IO server.
         *
         * @param data The message
         * @returns {Transport}
         * @api public
         */
      
        XHR.prototype.send = function (data) {
          this.post(data);
          return this;
        };
      
        /**
         * Posts a encoded message to the Socket.IO server.
         *
         * @param {String} data A encoded message.
         * @api private
         */
      
        function empty () { };
      
        XHR.prototype.post = function (data) {
          var self = this;
          this.socket.setBuffer(true);
      
          function stateChange () {
            if (this.readyState == 4) {
              this.onreadystatechange = empty;
              self.posting = false;
      
              if (this.status == 200){
                self.socket.setBuffer(false);
              } else {
                self.onClose();
              }
            }
          }
      
          function onload () {
            this.onload = empty;
            self.socket.setBuffer(false);
          };
      
          this.sendXHR = this.request('POST');
      
          if (global.XDomainRequest && this.sendXHR instanceof XDomainRequest) {
            this.sendXHR.onload = this.sendXHR.onerror = onload;
          } else {
            this.sendXHR.onreadystatechange = stateChange;
          }
      
          this.sendXHR.send(data);
        };
      
        /**
         * Disconnects the established `XHR` connection.
         *
         * @returns {Transport}
         * @api public
         */
      
        XHR.prototype.close = function () {
          this.onClose();
          return this;
        };
      
        /**
         * Generates a configured XHR request
         *
         * @param {String} url The url that needs to be requested.
         * @param {String} method The method the request should use.
         * @returns {XMLHttpRequest}
         * @api private
         */
      
        XHR.prototype.request = function (method) {
          var req = io.util.request(this.socket.isXDomain())
            , query = io.util.query(this.socket.options.query, 't=' + +new Date);
      
          req.open(method || 'GET', this.prepareUrl() + query, true);
      
          if (method == 'POST') {
            try {
              if (req.setRequestHeader) {
                req.setRequestHeader('Content-type', 'text/plain;charset=UTF-8');
              } else {
                // XDomainRequest
                req.contentType = 'text/plain';
              }
            } catch (e) {}
          }
      
          return req;
        };
      
        /**
         * Returns the scheme to use for the transport URLs.
         *
         * @api private
         */
      
        XHR.prototype.scheme = function () {
          return this.socket.options.secure ? 'https' : 'http';
        };
      
        /**
         * Check if the XHR transports are supported
         *
         * @param {Boolean} xdomain Check if we support cross domain requests.
         * @returns {Boolean}
         * @api public
         */
      
        XHR.check = function (socket, xdomain) {
          try {
            var request = io.util.request(xdomain),
                usesXDomReq = (global.XDomainRequest && request instanceof XDomainRequest),
                socketProtocol = (socket && socket.options && socket.options.secure ? 'https:' : 'http:'),
                isXProtocol = (global.location && socketProtocol != global.location.protocol);
            if (request && !(usesXDomReq && isXProtocol)) {
              return true;
            }
          } catch(e) {}
      
          return false;
        };
      
        /**
         * Check if the XHR transport supports cross domain requests.
         *
         * @returns {Boolean}
         * @api public
         */
      
        XHR.xdomainCheck = function (socket) {
          return XHR.check(socket, true);
        };
      
      })(
          'undefined' != typeof io ? io.Transport : module.exports
        , 'undefined' != typeof io ? io : module.parent.exports
        , this
      );
      /**
       * socket.io
       * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
       * MIT Licensed
       */
      
      (function (exports, io) {
      
        /**
         * Expose constructor.
         */
      
        exports.htmlfile = HTMLFile;
      
        /**
         * The HTMLFile transport creates a `forever iframe` based transport
         * for Internet Explorer. Regular forever iframe implementations will 
         * continuously trigger the browsers buzy indicators. If the forever iframe
         * is created inside a `htmlfile` these indicators will not be trigged.
         *
         * @constructor
         * @extends {io.Transport.XHR}
         * @api public
         */
      
        function HTMLFile (socket) {
          io.Transport.XHR.apply(this, arguments);
        };
      
        /**
         * Inherits from XHR transport.
         */
      
        io.util.inherit(HTMLFile, io.Transport.XHR);
      
        /**
         * Transport name
         *
         * @api public
         */
      
        HTMLFile.prototype.name = 'htmlfile';
      
        /**
         * Creates a new Ac...eX `htmlfile` with a forever loading iframe
         * that can be used to listen to messages. Inside the generated
         * `htmlfile` a reference will be made to the HTMLFile transport.
         *
         * @api private
         */
      
        HTMLFile.prototype.get = function () {
          this.doc = new window[(['Active'].concat('Object').join('X'))]('htmlfile');
          this.doc.open();
          this.doc.write('<html></html>');
          this.doc.close();
          this.doc.parentWindow.s = this;
      
          var iframeC = this.doc.createElement('div');
          iframeC.className = 'socketio';
      
          this.doc.body.appendChild(iframeC);
          this.iframe = this.doc.createElement('iframe');
      
          iframeC.appendChild(this.iframe);
      
          var self = this
            , query = io.util.query(this.socket.options.query, 't='+ +new Date);
      
          this.iframe.src = this.prepareUrl() + query;
      
          io.util.on(window, 'unload', function () {
            self.destroy();
          });
        };
      
        /**
         * The Socket.IO server will write script tags inside the forever
         * iframe, this function will be used as callback for the incoming
         * information.
         *
         * @param {String} data The message
         * @param {document} doc Reference to the context
         * @api private
         */
      
        HTMLFile.prototype._ = function (data, doc) {
          // unescape all forward slashes. see GH-1251
          data = data.replace(/\\\//g, '/');
          this.onData(data);
          try {
            var script = doc.getElementsByTagName('script')[0];
            script.parentNode.removeChild(script);
          } catch (e) { }
        };
      
        /**
         * Destroy the established connection, iframe and `htmlfile`.
         * And calls the `CollectGarbage` function of Internet Explorer
         * to release the memory.
         *
         * @api private
         */
      
        HTMLFile.prototype.destroy = function () {
          if (this.iframe){
            try {
              this.iframe.src = 'about:blank';
            } catch(e){}
      
            this.doc = null;
            this.iframe.parentNode.removeChild(this.iframe);
            this.iframe = null;
      
            CollectGarbage();
          }
        };
      
        /**
         * Disconnects the established connection.
         *
         * @returns {Transport} Chaining.
         * @api public
         */
      
        HTMLFile.prototype.close = function () {
          this.destroy();
          return io.Transport.XHR.prototype.close.call(this);
        };
      
        /**
         * Checks if the browser supports this transport. The browser
         * must have an `Ac...eXObject` implementation.
         *
         * @return {Boolean}
         * @api public
         */
      
        HTMLFile.check = function (socket) {
          if (typeof window != "undefined" && (['Active'].concat('Object').join('X')) in window){
            try {
              var a = new window[(['Active'].concat('Object').join('X'))]('htmlfile');
              return a && io.Transport.XHR.check(socket);
            } catch(e){}
          }
          return false;
        };
      
        /**
         * Check if cross domain requests are supported.
         *
         * @returns {Boolean}
         * @api public
         */
      
        HTMLFile.xdomainCheck = function () {
          // we can probably do handling for sub-domains, we should
          // test that it's cross domain but a subdomain here
          return false;
        };
      
        /**
         * Add the transport to your public io.transports array.
         *
         * @api private
         */
      
        io.transports.push('htmlfile');
      
      })(
          'undefined' != typeof io ? io.Transport : module.exports
        , 'undefined' != typeof io ? io : module.parent.exports
      );
      
      /**
       * socket.io
       * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
       * MIT Licensed
       */
      
      (function (exports, io, global) {
      
        /**
         * Expose constructor.
         */
      
        exports['xhr-polling'] = XHRPolling;
      
        /**
         * The XHR-polling transport uses long polling XHR requests to create a
         * "persistent" connection with the server.
         *
         * @constructor
         * @api public
         */
      
        function XHRPolling () {
          io.Transport.XHR.apply(this, arguments);
        };
      
        /**
         * Inherits from XHR transport.
         */
      
        io.util.inherit(XHRPolling, io.Transport.XHR);
      
        /**
         * Merge the properties from XHR transport
         */
      
        io.util.merge(XHRPolling, io.Transport.XHR);
      
        /**
         * Transport name
         *
         * @api public
         */
      
        XHRPolling.prototype.name = 'xhr-polling';
      
        /**
         * Indicates whether heartbeats is enabled for this transport
         *
         * @api private
         */
      
        XHRPolling.prototype.heartbeats = function () {
          return false;
        };
      
        /** 
         * Establish a connection, for iPhone and Android this will be done once the page
         * is loaded.
         *
         * @returns {Transport} Chaining.
         * @api public
         */
      
        XHRPolling.prototype.open = function () {
          var self = this;
      
          io.Transport.XHR.prototype.open.call(self);
          return false;
        };
      
        /**
         * Starts a XHR request to wait for incoming messages.
         *
         * @api private
         */
      
        function empty () {};
      
        XHRPolling.prototype.get = function () {
          if (!this.isOpen) return;
      
          var self = this;
      
          function stateChange () {
            if (this.readyState == 4) {
              this.onreadystatechange = empty;
      
              if (this.status == 200) {
                self.onData(this.responseText);
                self.get();
              } else {
                self.onClose();
              }
            }
          };
      
          function onload () {
            this.onload = empty;
            this.onerror = empty;
            self.retryCounter = 1;
            self.onData(this.responseText);
            self.get();
          };
      
          function onerror () {
            self.retryCounter ++;
            if(!self.retryCounter || self.retryCounter > 3) {
              self.onClose();  
            } else {
              self.get();
            }
          };
      
          this.xhr = this.request();
      
          if (global.XDomainRequest && this.xhr instanceof XDomainRequest) {
            this.xhr.onload = onload;
            this.xhr.onerror = onerror;
          } else {
            this.xhr.onreadystatechange = stateChange;
          }
      
          this.xhr.send(null);
        };
      
        /**
         * Handle the unclean close behavior.
         *
         * @api private
         */
      
        XHRPolling.prototype.onClose = function () {
          io.Transport.XHR.prototype.onClose.call(this);
      
          if (this.xhr) {
            this.xhr.onreadystatechange = this.xhr.onload = this.xhr.onerror = empty;
            try {
              this.xhr.abort();
            } catch(e){}
            this.xhr = null;
          }
        };
      
        /**
         * Webkit based browsers show a infinit spinner when you start a XHR request
         * before the browsers onload event is called so we need to defer opening of
         * the transport until the onload event is called. Wrapping the cb in our
         * defer method solve this.
         *
         * @param {Socket} socket The socket instance that needs a transport
         * @param {Function} fn The callback
         * @api private
         */
      
        XHRPolling.prototype.ready = function (socket, fn) {
          var self = this;
      
          io.util.defer(function () {
            fn.call(self);
          });
        };
      
        /**
         * Add the transport to your public io.transports array.
         *
         * @api private
         */
      
        io.transports.push('xhr-polling');
      
      })(
          'undefined' != typeof io ? io.Transport : module.exports
        , 'undefined' != typeof io ? io : module.parent.exports
        , this
      );
      
      /**
       * socket.io
       * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
       * MIT Licensed
       */
      
      (function (exports, io, global) {
        /**
         * There is a way to hide the loading indicator in Firefox. If you create and
         * remove a iframe it will stop showing the current loading indicator.
         * Unfortunately we can't feature detect that and UA sniffing is evil.
         *
         * @api private
         */
      
        var indicator = global.document && "MozAppearance" in
          global.document.documentElement.style;
      
        /**
         * Expose constructor.
         */
      
        exports['jsonp-polling'] = JSONPPolling;
      
        /**
         * The JSONP transport creates an persistent connection by dynamically
         * inserting a script tag in the page. This script tag will receive the
         * information of the Socket.IO server. When new information is received
         * it creates a new script tag for the new data stream.
         *
         * @constructor
         * @extends {io.Transport.xhr-polling}
         * @api public
         */
      
        function JSONPPolling (socket) {
          io.Transport['xhr-polling'].apply(this, arguments);
      
          this.index = io.j.length;
      
          var self = this;
      
          io.j.push(function (msg) {
            self._(msg);
          });
        };
      
        /**
         * Inherits from XHR polling transport.
         */
      
        io.util.inherit(JSONPPolling, io.Transport['xhr-polling']);
      
        /**
         * Transport name
         *
         * @api public
         */
      
        JSONPPolling.prototype.name = 'jsonp-polling';
      
        /**
         * Posts a encoded message to the Socket.IO server using an iframe.
         * The iframe is used because script tags can create POST based requests.
         * The iframe is positioned outside of the view so the user does not
         * notice it's existence.
         *
         * @param {String} data A encoded message.
         * @api private
         */
      
        JSONPPolling.prototype.post = function (data) {
          var self = this
            , query = io.util.query(
                   this.socket.options.query
                , 't='+ (+new Date) + '&i=' + this.index
              );
      
          if (!this.form) {
            var form = document.createElement('form')
              , area = document.createElement('textarea')
              , id = this.iframeId = 'socketio_iframe_' + this.index
              , iframe;
      
            form.className = 'socketio';
            form.style.position = 'absolute';
            form.style.top = '0px';
            form.style.left = '0px';
            form.style.display = 'none';
            form.target = id;
            form.method = 'POST';
            form.setAttribute('accept-charset', 'utf-8');
            area.name = 'd';
            form.appendChild(area);
            document.body.appendChild(form);
      
            this.form = form;
            this.area = area;
          }
      
          this.form.action = this.prepareUrl() + query;
      
          function complete () {
            initIframe();
            self.socket.setBuffer(false);
          };
      
          function initIframe () {
            if (self.iframe) {
              self.form.removeChild(self.iframe);
            }
      
            try {
              // ie6 dynamic iframes with target="" support (thanks Chris Lambacher)
              iframe = document.createElement('<iframe name="'+ self.iframeId +'">');
            } catch (e) {
              iframe = document.createElement('iframe');
              iframe.name = self.iframeId;
            }
      
            iframe.id = self.iframeId;
      
            self.form.appendChild(iframe);
            self.iframe = iframe;
          };
      
          initIframe();
      
          // we temporarily stringify until we figure out how to prevent
          // browsers from turning `\n` into `\r\n` in form inputs
          this.area.value = io.JSON.stringify(data);
      
          try {
            this.form.submit();
          } catch(e) {}
      
          if (this.iframe.attachEvent) {
            iframe.onreadystatechange = function () {
              if (self.iframe.readyState == 'complete') {
                complete();
              }
            };
          } else {
            this.iframe.onload = complete;
          }
      
          this.socket.setBuffer(true);
        };
      
        /**
         * Creates a new JSONP poll that can be used to listen
         * for messages from the Socket.IO server.
         *
         * @api private
         */
      
        JSONPPolling.prototype.get = function () {
          var self = this
            , script = document.createElement('script')
            , query = io.util.query(
                   this.socket.options.query
                , 't='+ (+new Date) + '&i=' + this.index
              );
      
          if (this.script) {
            this.script.parentNode.removeChild(this.script);
            this.script = null;
          }
      
          script.async = true;
          script.src = this.prepareUrl() + query;
          script.onerror = function () {
            self.onClose();
          };
      
          var insertAt = document.getElementsByTagName('script')[0];
          insertAt.parentNode.insertBefore(script, insertAt);
          this.script = script;
      
          if (indicator) {
            setTimeout(function () {
              var iframe = document.createElement('iframe');
              document.body.appendChild(iframe);
              document.body.removeChild(iframe);
            }, 100);
          }
        };
      
        /**
         * Callback function for the incoming message stream from the Socket.IO server.
         *
         * @param {String} data The message
         * @api private
         */
      
        JSONPPolling.prototype._ = function (msg) {
          this.onData(msg);
          if (this.isOpen) {
            this.get();
          }
          return this;
        };
      
        /**
         * The indicator hack only works after onload
         *
         * @param {Socket} socket The socket instance that needs a transport
         * @param {Function} fn The callback
         * @api private
         */
      
        JSONPPolling.prototype.ready = function (socket, fn) {
          var self = this;
          if (!indicator) return fn.call(this);
      
          io.util.load(function () {
            fn.call(self);
          });
        };
      
        /**
         * Checks if browser supports this transport.
         *
         * @return {Boolean}
         * @api public
         */
      
        JSONPPolling.check = function () {
          return 'document' in global;
        };
      
        /**
         * Check if cross domain requests are supported
         *
         * @returns {Boolean}
         * @api public
         */
      
        JSONPPolling.xdomainCheck = function () {
          return true;
        };
      
        /**
         * Add the transport to your public io.transports array.
         *
         * @api private
         */
      
        io.transports.push('jsonp-polling');
      
      })(
          'undefined' != typeof io ? io.Transport : module.exports
        , 'undefined' != typeof io ? io : module.parent.exports
        , this
      );
      
      if (typeof define === "function" && define.amd) {
        define([], function () { return io; });
      }
      })();;
      }
    ], [
      {
        /*
          /home/stayrad/Projects/Groovy/app/source/js/player.coffee
        */

        'jqueryify': 13,
        'base': 2,
        './track': 19,
        './settings': 16
      }, function(require, module, exports) {
        var $, Base, Player, Track, settings;
        $ = require('jqueryify');
        Base = require('base');
        Track = require('./track');
        settings = require('./settings');
        Player = (function(_super) {
          __extends(Player, _super);

          Player.prototype.events = {
            'click .prev': 'prev',
            'click .next': 'next',
            'click .play-pause': 'toggle'
          };

          Player.prototype.elements = {
            '.track': 'track',
            '.now-playing': 'nowPlaying'
          };

          Player.prototype.audioEvents = {
            'durationchange': 'setDuration',
            'progress': 'showBufferProgress',
            'timeupdate': 'showCurrentProgress'
          };

          function Player() {
            this.setDuration = __bind(this.setDuration, this);
            this.setSource = __bind(this.setSource, this);
            this.setSong = __bind(this.setSong, this);
            this.setVolume = __bind(this.setVolume, this);
            this.showCurrentProgress = __bind(this.showCurrentProgress, this);
            this.showBufferProgress = __bind(this.showBufferProgress, this);
            this._percent = __bind(this._percent, this);
            this.next = __bind(this.next, this);
            this.prev = __bind(this.prev, this);
            this.toggle = __bind(this.toggle, this);
            var event, method, track, _ref;
            Player.__super__.constructor.apply(this, arguments);
            this.audio = $('<audio>');
            this.audio.attr({
              autoplay: true,
              preload: 'auto',
              controls: true
            });
            $('body').append(this.context);
            this.context = this.audio.get(0);
            track = this.track = new Track({
              el: this.track
            });
            _ref = this.audioEvents;
            for (event in _ref) {
              method = _ref[event];
              this.context.addEventListener(event, this[method]);
            }
          }

          Player.prototype.toggle = function() {
            if (this.context.paused) {
              return this.context.play();
            } else {
              return this.context.pause();
            }
          };

          Player.prototype.prev = function() {
            return this.context.currentTime = 0;
          };

          Player.prototype.next = function() {
            return this.context.currentTime += 10;
          };

          Player.prototype._percent = function(x) {
            return x / this.duration * 100;
          };

          Player.prototype.showBufferProgress = function() {
            var percent;
            if (this.context.buffered.length > 0) {
              percent = this._percent(this.context.buffered.end(0));
              return this.track.setBuffer(percent);
            }
          };

          Player.prototype.showCurrentProgress = function() {
            var percent;
            percent = this._percent(this.context.currentTime);
            return this.track.setPlaying(percent);
          };

          Player.prototype.setVolume = function(volume) {
            return this.context.volume = volume;
          };

          Player.prototype.setSong = function(song) {
            var url;
            this.trigger('change', song);
            url = "http://" + settings.host + ":" + settings.port + "/song/" + song.SongID + ".mp3?t=" + (Date.now());
            return this.setSource(url);
          };

          Player.prototype.setSource = function(url) {
            return this.context.src = url;
          };

          Player.prototype.setDuration = function() {
            return this.duration = this.context.duration;
          };

          return Player;

        })(Base.View);
        return module.exports = Player;
      }
    ], [
      {
        /*
          /home/stayrad/Projects/Groovy/app/source/js/track.coffee
        */

        'base': 2
      }, function(require, module, exports) {
        var Base, Track;
        Base = require('base');
        Track = (function(_super) {
          __extends(Track, _super);

          Track.prototype.elements = {
            '.playing': 'playing',
            '.buffer': 'buffer'
          };

          function Track() {
            Track.__super__.constructor.apply(this, arguments);
          }

          Track.prototype.setPlaying = function(percent) {
            return this.playing.css('width', percent + '%');
          };

          Track.prototype.setBuffer = function(percent) {
            return this.buffer.css('width', percent + '%');
          };

          return Track;

        })(Base.View);
        return module.exports = Track;
      }
    ], [
      {
        /*
          /home/stayrad/Projects/Groovy/app/source/js/search.coffee
        */

        'base': 2
      }, function(require, module, exports) {
        var Base, Search;
        Base = require('base');
        Search = (function(_super) {
          __extends(Search, _super);

          Search.prototype.elements = {
            '.search input': 'input',
            '.dropdown': 'dropdown',
            '.dropdown button': 'chosenType'
          };

          Search.prototype.events = {
            'keydown .search': 'open',
            'click .dropdown ul li': 'chooseItem'
          };

          function Search() {
            this.chooseItem = __bind(this.chooseItem, this);
            this.open = __bind(this.open, this);
            Search.__super__.constructor.apply(this, arguments);
            this.type = 'Songs';
          }

          Search.prototype.open = function(e) {
            var query;
            if (e.which !== 13) {
              return true;
            }
            query = this.input.val();
            if (!isNaN(parseInt(query))) {
              this.trigger('playlist', query);
            } else {
              this.trigger('search', query, this.type);
            }
            return true;
          };

          Search.prototype.chooseItem = function(event) {
            var element, name;
            element = $(event.target);
            name = element.text();
            this.type = (function() {
              switch (element.data('id')) {
                case 0:
                  return 'Songs';
                case 1:
                  return 'Playlists';
                case 2:
                  return 'Artists';
                case 3:
                  return 'Albums';
              }
            })();
            this.chosenType.text(name);
            this.dropdown.find('.active').removeClass('active');
            element.toggleClass('active');
            return console.log('chosing type', this.type);
          };

          return Search;

        })(Base.View);
        return module.exports = Search;
      }
    ], [
      {
        /*
          /home/stayrad/Projects/Groovy/app/source/js/bar.coffee
        */

        'base': 2
      }, function(require, module, exports) {
        var Bar, Base;
        Base = require('base');
        Bar = (function(_super) {
          __extends(Bar, _super);

          Bar.prototype.elements = {
            '.now-playing .artist': 'nowPlayingArtist',
            '.now-playing .song': 'nowPlayingSong'
          };

          function Bar() {
            Bar.__super__.constructor.apply(this, arguments);
          }

          Bar.prototype.setSong = function(song) {
            this.nowPlayingArtist.text(song.ArtistName);
            return this.nowPlayingSong.text(song.SongName);
          };

          return Bar;

        })(Base.View);
        return module.exports = Bar;
      }
    ]
  ]);

}).call(this);
