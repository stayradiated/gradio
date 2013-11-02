$        = require 'jqueryify'
Base     = require 'base'
Track    = require './track'
settings = require './settings'

class Player extends Base.View

  events:
    'click .prev': 'prev'
    'click .next': 'next'
    'click .play-pause': 'toggle'

  elements:
    '.track': 'track'
    '.now-playing': 'nowPlaying'

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

    # Create track
    track = @track = new Track(el: @track)

    # Bind audio events
    for event, method of @audioEvents
      @context.addEventListener(event, @[method])

    window.toggle = @toggle

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
      @track.setBuffer(percent)

  showCurrentProgress: =>
    percent = @_percent @context.currentTime
    @track.setPlaying(percent)

  setVolume: (volume) =>
    @context.volume = volume

  setSong: (song) =>
    @trigger 'change', song
    url = "http://#{ settings.host }:#{ settings.port }/song/#{ song.SongID }.mp3?t=#{ Date.now() }"
    @setSource(url)

  setSource: (url) =>
    @context.src  = url

  setDuration: =>
    @duration = @context.duration

module.exports = Player
