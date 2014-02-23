User = (methods, createMethod) ->

  methods.user ?= {}

  methods.user.library = createMethod
    name: 'userGetSongsInLibrary'
    parameters: (user, page) ->
      userID: user
      page: page

  methods.user.favorites = createMethod
    name: 'getFavorites'
    parameters: (user, type) ->
      userID: user
      ofWhat: type

  methods.user.addSongs = createMethod
    name: 'userAddSongsToLibrary'
    parameters: (songs) ->
      songs: songs

  methods.user.favorite = createMethod
    name: 'favorite'
    parameters: (song, type) ->
      what: type
      ID: song.songID
      details: song


module.exports = User
