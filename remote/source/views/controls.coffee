Base = require 'base'

class Controls extends Base.View

  el: '.app .controls'

  events:
    'click .prev': 'prev'
    'click .play': 'play'
    'click .next': 'next'

  ui:
    prev: '.prev'
    play: '.play'
    next: '.next'

  constructor: ->
    super

    @playing = false

  prev: ->
    console.log 'prev'

  play: =>
    @playing = not @playing
    @ui.play.toggleClass 'pause', @playing
    console.log 'playing', @playing

  next: ->
    console.log 'next'

module.exports = Controls