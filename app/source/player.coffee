
$ = require 'jqueryify'
Base = require 'base'

class Player extends Base.Controller

  events:
    'click .prev': 'prev'
    'click .next': 'next'
    'click .play-pause': 'toggle'

  elements:
    '.track': 'track'
    '.buffer': 'buffer'

  audioEvents:
    'durationchange': 'setDuration'
    'progress': 'showBufferProgress'
    'timeupdate': 'showCurrentProgress'

  # el is the audio-controls element
  constructor: ->
    super

    # Create a new audio element
    @audio = $('<audio>')
    @audio.attr
      autoplay: true
      preload: 'auto'
      controls: true
    $('body').append(@context)
    @context = @audio.get(0)

    # Bind audio events
    for event, method of @audioEvents
      @context.addEventListener(event, @[method])

  toggle: =>
    if @context.paused
      @context.play()
    else
      @context.pause()

  prev: =>
    @context.currentTime = 0

  next: =>
    @context.currentTime += 10

  _percent: (x) =>
    x / @duration * 100

  showBufferProgress: =>
    if @context.buffered.length > 0
      percent = @_percent @context.buffered.end(0)
      @buffer.css 'width', percent + '%'

  showCurrentProgress: =>
    percent = @_percent @context.currentTime
    @track.css 'width', percent + '%'

  setVolume: (volume) =>
    @context.volume = volume

  setSource: (url) =>
    @context.src  = url

  setDuration: =>
    @duration = @context.duration

module.exports = Player
