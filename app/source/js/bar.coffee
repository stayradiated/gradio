Base = require 'base'

class Bar extends Base.View

  ui:
    artist: '.now-playing .artist'
    song: '.now-playing .song'

  constructor: ->
    super

  setSong: (song) ->
    @ui.artist.text(song.ArtistName)
    @ui.song.text(song.SongName)

module.exports = Bar
