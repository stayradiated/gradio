FastClick = require 'fastclick'

Content  = require '../views/content'
Controls = require '../views/controls'
Title    = require '../views/title'

event = require '../utils/event'

class App

  constructor: ->
    console.log 'starting app'

    FastClick(document.body)

    new Content()
    new Controls()
    new Title()

    event.trigger 'song:change',
      name: 'Homeward Bound'
      artist: 'Simon and Garfunkle'

module.exports = App
