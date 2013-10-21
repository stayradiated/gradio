Base = require 'base'

class Bar extends Base.View

  elements:
    '.now-playing .artist' : 'nowPlayingArtist'
    '.now-playing .song'   : 'nowPlayingSong'

  constructor: ->
    super

  setSong: (song) ->
    @nowPlayingArtist.text(song.ArtistName);
    @nowPlayingSong.text(song.SongName)

module.exports = Bar
