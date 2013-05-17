Core = require '../src/core'
Methods = require '../src/methods'
Song = require '../src/models/song'
SongList = require '../src/models/songList'

core = new Core()
app = new Methods(core)

describe 'Methods', ->

  # TODO: Move into the <before testing> section
  before (done) ->
    core.init().then ->
      done()

  it 'should just get playlist information', (done) ->

    app.getPlaylistSongs(40354457).then (response) ->
      console.log response
      done()

###

  it 'should get the playlist songs', (done) ->

    app.getPlaylistSongs(40354457).then (response) ->
      songs = new SongList(response.Songs)
      done()
###
