FastClick = require 'fastclick'

# Controllers
groovy   = require('../controllers/groovy')

# Views
Content  = require('../views/content')
Controls = require('../views/controls')
Title    = require('../views/title')

# Utils
event = require('../utils/event')


class App

  constructor: ->
    console.log 'starting app'

    groovy.init('http://192.168.0.100:7070/ws')

    FastClick(document.body)

    new Content()
    new Controls()
    new Title()

    event.trigger 'song:change',
      name: 'Homeward Bound'
      artist: 'Simon and Garfunkle'

module.exports = App
