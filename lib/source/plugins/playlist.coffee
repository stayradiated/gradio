
Playlist = (methods, createMethod) ->

  methods.playlist ?= {}

  methods.playlist.create = createMethod
    name: 'createPlaylist'
    parameters: (name, about, ids) ->
      playlistName: name
      playlistAbout: about
      songIDs: ids

  methods.playlist.read = createMethod
    name: 'getPlaylistByID'
    pattern: '!.result.Songs.*'
    parameters: (id) ->
      playlistID: id

  methods.playlist.addSong = createMethod
    name: 'playlistAddSongToExisting'
    parameters: (playlist, song) ->
      playlistID: playlist
      songID: song

  methods.playlist.all = createMethod
    name: 'userGetPlaylists'
    parameters: (user) ->
      userID: user

module.exports = Playlist


