
# Easy element selector
$ = (parent, child) ->
  return parent.querySelector(child)

# Player class
class Player

  events:

    audio:
      'durationchange': 'setDuration'
      'progress': 'showBufferProgress'
      'timeupdate': 'showCurrentProgress'

    dom:
      'click .prev': 'prev'
      'click .next': 'next'
      'click .play-pause': 'toggle'

    keydown:
      '32': 'toggle'

  # el is the audio-controls element
  constructor: (@el) ->

    # Create a new audio element
    @context = document.createElement('audio')
    @context.setAttribute('autoplay', true)
    @context.setAttribute('preload', 'auto')
    @context.setAttribute('controls', true)
    document.body.appendChild(@context)

    @range =
      track: $(@el, '.track')
      buffer: $(@el, '.buffer')

    # Bind audio events
    for event, method of @events.audio
      @context.addEventListener(event, @[method])

    # Bind html events
    for str, method of @events.dom
      [str, ev, el] = str.match(/^(\w+) (.+)$/)
      $(@el, el).addEventListener(ev, @[method])

    # Bind key events
    document.addEventListener 'keydown', (e) =>
      for keyCode, method of @events.keydown
        if e.keyCode.toString() is keyCode
          @[method]()
      return true

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
      @range.buffer.style.width = percent + '%'

  showCurrentProgress: =>
    percent = @_percent @context.currentTime
    @range.track.style.width = percent + '%'

  setVolume: (volume) =>
    @context.volume = volume

  setSource: (url) =>
    @context.src  = url

  setDuration: =>
    console.log '> Setting duration'
    @duration = @context.duration

# Create a new audio player instance and set the source
window.audio = audio = new Player $(document, '.audio-controls')
audio.setSource('http://localhost:8080/song/The String Quartet - Trouble.mp3')


# getTime = (time) ->
#   minutes = Math.floor(time / 60)
#   seconds = Math.floor(time % 60)
#   minutes + ":" + seconds
