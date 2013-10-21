
# [==============================================|                          ]
#
# Buffer track

Base = require 'base'

class Track extends Base.View

  elements:
    '.playing': 'playing'
    '.buffer': 'buffer'

  constructor: ->
    super

  setPlaying: (percent) ->
    @playing.css 'width', percent + '%'

  setBuffer: (percent) ->
    @buffer.css 'width', percent + '%'

module.exports = Track


