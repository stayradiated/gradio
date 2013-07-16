
Base = require 'base'
Ranger = require 'ranger'

# Groovy
Core = require '../../bin/core'
Methods = require '../../bin/methods'
Server = require '../../bin/server'

# Groovy App
Player = require './player'
Search = require './search'

module.exports.init = ->

  core = new Core()
  app = new Methods(core)

  # Start Groovy and connect to Grooveshark
  core.init()

  # Start the audio server
  port = 8080
  server = new Server(core)
  server.listen(port)

  search = new Search
    el: $('.search-form')

  player = new Player
    el: $('.audio-controls')

  global.ranger = ranger = new Ranger
    el: $('.ranger')

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

  openItem = ->
    console.log 'Opening item'
    song = ranger.open()
    return unless song
    url = "http://localhost:#{ port }/song/#{ song.SongID }.mp3"
    player.setSource(url)

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
