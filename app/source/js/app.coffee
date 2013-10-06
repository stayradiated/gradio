Base   = require 'base'
Ranger = require 'ranger'
$      = require 'jqueryify'

Client = require './client'
Player = require './player'
Search = require './search'
Bar    = require './bar'

module.exports.init = ->

  app = app = new Client()

  bar = new Bar
    el: $('.bar')

  search = new Search
    el: $('header.panel')

  player = new Player
    el: $('section.controls')

  ranger = ranger = new Ranger
    el: $('section.columns')

  player.on 'change', (song) ->
    bar.setSong(song)

  search.on 'playlist', (id) ->
    app.getPlaylistSongs(id).then (response) ->
      ranger.loadRaw response.Songs, [
        ['Artist', 'ArtistName']
        ['Songs', 'Name']
      ]

  search.on 'search', (query, type) ->
    app.getSearchResults(query, type).then (response) ->
      console.log response
      ranger.loadRaw response.result, [
        ['Artist', 'ArtistName']
        ['Songs', 'SongName']
      ]

  # Load offline files
  parseOffline = ->
    fs = require('fs')
    songIDs = []
    fs.readdir "#{ __dirname }/../../../cache", (err, files) ->
      for file in files
        id = file.match(/(\d+)\.mp3/)
        if id? then songIDs.push(id[1])
      app.getSongInfo(songIDs).then (results) ->
        ranger.loadRaw results, [
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

  $('.decorations').on('click', ->
    openItem()
  )

  # Track input focus - for keyboard shortcuts
  focus = false
  $('input').each ->
    @addEventListener 'focus', ->
      console.log 'focus'
      focus = true
    @addEventListener 'blur', ->
      console.log 'blur'
      focus = false
