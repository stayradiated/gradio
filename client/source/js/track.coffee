
# [==============================================|                          ]
#
# Buffer track

Base = require 'base'

class Track extends Base.View

  ui:
    playing: '.playing'
    buffer: '.buffer'

  constructor: ->
    super

  setPlaying: (percent) ->
    @ui.playing.css 'width', percent + '%'

  setBuffer: (percent) ->
    @ui.buffer.css 'width', percent + '%'

module.exports = Track


