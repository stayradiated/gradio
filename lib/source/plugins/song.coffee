Song = (methods, createMethod) ->

  methods.songs ?= {}

  methods.songs.info = createMethod
    name: 'getQueueSongListFromSongIDs'
    pattern: '!.result.*'
    parameters: (ids) ->
      songIDs: ids

  methods.songs.popular = createMethod
    name: 'popularGetSongs'
    pattern: '!.result.*'
    parameters: (type) ->
      type: type

  methods.songs.inAlbum = createMethod
    name: 'albumGetAllSongs'
    pattern: '!.result.*'
    parameters: (album) ->
      albumID: album

  methods.songs.byArtist = createMethod
    name: 'artistGetSongs'
    parameters: (artist) ->
      artistID: artist

module.exports = Song
