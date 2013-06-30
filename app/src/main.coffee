
global.document = document

Player = require './js/player'
Playlist = require './js/playlist'
$ = require './js/dom'

Core = require '../bin/core'
Methods = require '../bin/methods'
Server = require '../bin/server'


core = new Core()
global.App = new Methods(core)

# Start the core running in the background...
core.init()

# Start the server
console.log 'starting server'
server = new Server(core)
server.listen(8080)

# Create a new audio player instance and set the source
global.Player = new Player $.class('audio-controls')[0]

# Initiate the playlist
window.playlist = new Playlist $.class('playlist')[0]

# Track input focus - for keyboard shortcuts
global.focus = false
for input in $.tag('input')
  input.addEventListener 'focus', -> global.focus = true
  input.addEventListener 'blur', -> global.focus = false


# getTime = (time) ->
#   minutes = Math.floor(time / 60)
#   seconds = Math.floor(time % 60)
#   minutes + ":" + seconds
