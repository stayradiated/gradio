
# This is kind of an odd project.
# Because it runs in both Node-Webkit as a desktop app,
# And in a web browser as a web app.

# Are we running in node?
NODEJS = global?.process?

$ = require 'jqueryify'

if NODEJS

  # Expose globals
  global.document = document
  global.$ = $
  global.NODEJS = NODEJS
  app = require './js/app'

# Running in webkit
else
  global = window.global = window
  global.NODEJS = NODEJS
  app = require './app.coffee'

# Server configuration
global.server = 'localhost'
global.port = 8080

# Initialise the app
app.init()

# Make debugging with Node-Webkit easier

if NODEJS
  win = require('nw.gui').Window.get()

  $(document).on 'keydown', (e) ->
    switch e.keyCode

      when 82 # r
        if e.ctrlKey
          win.reloadDev()

      when 68 # d
        if e.ctrlKey
          win.showDevTools()


