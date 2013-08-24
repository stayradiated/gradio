# This is kind of an odd project.
# Because it runs in both Node-Webkit as a desktop app,
# And in a web browser as a web app.

# Are we running in node?
NODEJS = process.title is 'node'

if NODEJS
  console.log 'Running in Node-Webkit'
else
  console.log 'Running in Browser'

$ = require 'jqueryify'

# Running in node-webkit
if NODEJS
  global.document = document
  global.$ = $
  global.NODEJS = NODEJS
  app = require './js/bin/app'

# Running in webkit
else
  global.NODEJS = NODEJS
  app = global.app = require './app.coffee'

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
