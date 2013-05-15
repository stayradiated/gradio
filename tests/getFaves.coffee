Core = require '../src/core'
Methods = require '../src/methods'
Song = require '../src/models/song'

core = new Core()
app = new Methods(core)

app.userGetSongsInLibrary(20910233).then (response) ->
  songs = response.result.Songs
  for song in songs
    new Song(song).printName()
