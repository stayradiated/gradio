
global.document = document

Player = require './js/player'
Playlist = require './js/playlist'
$ = require './js/dom'

Core = require './../bin/core'
Methods = require './../bin/methods'

core = new Core()
global.App = new Methods(core)

# Start the core running in the background...
core.init()

# Create a new audio player instance and set the source
global.Player = new Player $('.audio-controls')

# Initiate the playlist
window.playlist = new Playlist $('.playlist')


# getTime = (time) ->
#   minutes = Math.floor(time / 60)
#   seconds = Math.floor(time % 60)
#   minutes + ":" + seconds
