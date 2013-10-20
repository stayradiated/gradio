Promise  = require 'when'
settings = require './settings'
SocketIo = require './lib/socket.io'

METHODS = [
  'getSongInfo',
  'getSearchResults',
  'getArtistsSongs',
  'getAlbumSongs',
  'getPlaylistSongs',
  'getPlaylistByID',
  'albumGetAllSongs',
  'userGetSongsInLibrary',
  'getFavorites',
  'getPopularSongs',
  'markSongAsDownloaded',
  'markStreamKeyOver30Seconds',
  'markSongComplete',
  'authenticateUser',
  'logoutUser',
  'initiateQueue',
  'createPlaylist',
  'playlistAddSongToExisting',
  'userAddSongsToLibrary',
  'favorite',
  'userGetPlaylists',
  'getSongUrl',
  'getSongStream'
]

class module.exports

  constructor: ->
    @socket = SocketIo.connect 'http://localhost:8080'
    @socket.on 'result', ([method, data]) ->
      console.log method, data

  _callMethod: (method, args) =>
    deferred = Promise.defer()
    @socket.emit 'call', [method, args]
    return deferred.promise

for method in METHODS
  do (method) ->
    module.exports::[method] = (args...) -> @_callMethod(method, args)