Base   = require('base')
Ranger = require('ranger')

Client = require('./client')
Player = require('./player')
Search = require('./search')
Bar    = require('./bar')

module.exports.init = ->

  client = new Client()

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

  client.on 'result', (method, item) ->

    console.log method, item

    switch method
      when 'broadcastStatusPoll'
        console.log item
        player.setSong item.activeSong
        bar.setSong item.activeSong
      else
        ranger.add item

  player.on 'change', (song) ->
    bar.setSong(song)

  search.on 'playlist', (id) ->
    currentBroadcast = false
    ranger.clear()
    client.emit('call', 'playlist.read', id)

  search.on 'search', (query, type) ->
    currentBroadcast  = false
    ranger.clear()
    switch type
      when 'User'
        ranger.setPanes [
          ['Songs', 'SongName']
        ]
        client.emit('call', 'user.library', [20910233])

      when 'Albums'
        client.emit('call', 'songs.inAlbum', [query])

      when 'Broadcast'
        ranger.setPanes [
          ['Broadcasts', 'n']
        ]
        client.emit('call', 'broadcast.top')

      when 'Best Of'
        ranger.setPanes [
          [query, 'Name']
        ]
        client.emit('call', 'getBestOf', [query])

      else
        ranger.setPanes [
          ['Artist', 'ArtistName']
          ['Songs', 'SongName']
        ]
        client.emit('call', 'search', [query, type])

  # Load offline files
  parseOffline = ->
    fs = require('fs')
    songIDs = []
    fs.readdir "#{ __dirname }/../../../cache", (err, files) ->
      for file in files
        id = file.match(/(\d+)\.mp3/)
        if id? then songIDs.push(id[1])
      client.emit('call', 'songs.info', songIDs).then (results) ->
        ranger.load results, [
          ['Artist', 'ArtistName']
          ['Songs', 'Name']
        ]


  currentBroadcast = null

  startBroadcast = (broadcast) ->
    console.log 'opening broadcast', broadcast
    currentBroadcast = broadcast.sub[6..]
    client.emit('call', 'broadcast.poll', currentBroadcast)

  player.on 'finished', ->
    return unless currentBroadcast
    client.emit('call', 'broadcast.poll', currentBroadcast)


  openItem = ->
    item = ranger.open()
    return unless item
    if item.sub?
      startBroadcast(item)
    else
      player.setSong(item)

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
