
# This is kind of an odd project.
# Because it runs in both Node-Webkit as a desktop app,
# And in a web browser as a web app.

# Are we running in node?
NODEJS = global.process?

$ = require 'jqueryify'

if not NODEJS

  # Expose globals
  global.document = document
  global.$ = $

  app = require './js/app'

# Running in webkit
else
  window.global = {}
  app = require './app.coffee'

# Server configuration
global.server = 'localhost'
global.port = 8080

# Initialise the app
app.init()

# Make debugging with Node-Webkit easier

win = require('nw.gui').Window.get()

$(document).on 'keydown', (e) ->
  switch e.keyCode

    when 82 # r
      if e.ctrlKey
        win.reloadDev()

    when 68 # d
      if e.ctrlKey
        win.showDevTools()


