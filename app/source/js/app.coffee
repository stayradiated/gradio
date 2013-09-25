Base = require 'base'
Ranger = require 'ranger'
$ = require 'jqueryify'

# Groovy
if global.NODEJS
  Core = require '../../../bin/core'
  Methods = require '../../../bin/methods'
  Server = require '../../../bin/server'
  Player = require './player'
  Search = require './search'
else
  global.Client = require './client.coffee'
  Player = require './player.coffee'
  Search = require './search.coffee'

module.exports.init = ->

  # Running as a standalone app starts it's own server
  if global.NODEJS

    core = new Core()
    app = new Methods(core)

    # Start Groovy and connect to Grooveshark
    core.init()

    # Start the audio server
    server = new Server(core)
    server.listen(global.port)

  # Running in a webbrowser connects to a server
  else
    global.client = app = new Client()

  search = new Search
    el: $('header.panel')

  player = new Player
    el: $('nav.controls')

  global.ranger = ranger = new Ranger
    el: $('section.columns')

  search.on 'playlist', (id) ->
    app.getPlaylistSongs(id).then (response) =>
      console.log response.Songs
      ranger.loadRaw response.Songs, [
        ['Artist', 'ArtistName']
        ['Songs', 'Name']
      ]

  search.on 'search', (query) ->
    app.getSearchResults(query, 'Songs').then (response) =>
      ranger.loadRaw response.result, [
        ['Artist', 'ArtistName']
        # ['Album', 'AlbumName']
        ['Songs', 'SongName']
      ]

  # Load offline files
  global.parseOffline = ->
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
        console.log global.focus
        return if global.focus
        openItem()
      when 32
        return if global.focus
        player.toggle()
      when 38 then ranger.up()
      when 37 then ranger.left()
      when 39 then ranger.right()
      when 40 then ranger.down()

    if 37 <= e.which <= 40
      e.preventDefault()
      return false

  # Track input focus - for keyboard shortcuts
  global.focus = false
  $('input').each ->
    @addEventListener 'focus', ->
      console.log 'focus'
      global.focus = true
    @addEventListener 'blur', ->
      console.log 'blur'
      global.focus = false
