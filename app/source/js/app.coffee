Base   = require 'base'
Ranger = require 'ranger'
$      = require 'jqueryify'

Client = require './client'
Player = require './player'
Search = require './search'
Bar    = require './bar'

module.exports.init = ->

  app = new Client()

  bar = new Bar
    el: $('.bar')

  search = new Search
    el: $('header.panel')

  player = new Player
    el: $('section.controls')

  ranger = new Ranger
    el: $('section.columns')

  ranger.setPanes [
    ['Artist', 'ArtistName']
    ['Songs', 'SongName']
  ]

  app.vent.on 'result', (method, song) ->
    ranger.add song

  player.on 'change', (song) ->
    bar.setSong(song)

  search.on 'playlist', (id) ->
    ranger.clear()
    app.getPlaylistByID(id)

  search.on 'search', (query, type) ->
    ranger.clear()
    app.getSearchResults(query, type)

  # Load offline files
  parseOffline = ->
    fs = require('fs')
    songIDs = []
    fs.readdir "#{ __dirname }/../../../cache", (err, files) ->
      for file in files
        id = file.match(/(\d+)\.mp3/)
        if id? then songIDs.push(id[1])
      app.getSongInfo(songIDs).then (results) ->
        ranger.load results, [
          ['Artist', 'ArtistName']
          ['Songs', 'Name']
        ]

  openItem = ->
    song = ranger.open()
    return unless song
    player.setSong(song)

  # Enable keyboard shortcuts
  $(document).on 'keydown', (e) ->

    switch e.which
      when 13
        console.log focus
        return if focus
        openItem()
      when 32
        return if focus
        player.toggle()
      when 38 then ranger.up()
      when 37 then ranger.left()
      when 39 then ranger.right()
      when 40 then ranger.down()

    if 37 <= e.which <= 40
      e.preventDefault()
      return false

  window.play = openItem

  # Track input focus - for keyboard shortcuts
  focus = false
  $('input').each ->
    @addEventListener 'focus', -> focus = true
    @addEventListener 'blur', -> focus = false
