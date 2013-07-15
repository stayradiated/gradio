
$ = require 'jqueryify'

# Expose globals
global.document = document
global.$ = $

# Initialise the app

app = require './js/app'
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


