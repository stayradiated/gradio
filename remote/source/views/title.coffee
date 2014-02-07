Base = require 'base'
event = require '../utils/event'

class Title extends Base.View

  el: '.app header .title'

  ui:
    song: '.song'
    artist: '.artist'

  constructor: ->
    super

    event.on 'song:change', (song) =>
      console.log song
      @setSong song.name
      @setArtist song.artist

  setSong: (name) ->
    @ui.song.text name

  setArtist: (name) ->
    @ui.artist.text name

module.exports = Title