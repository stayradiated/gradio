Base     = require 'base'
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
    @socket = SocketIo.connect "http://#{ settings.host }:#{ settings.port }"
    @vent = new Base.Event()

    @socket.on 'result', ([method, data]) =>
      @vent.trigger 'result', method, data

  _callMethod: (method, args) =>
    @socket.emit 'call', [method, args]

for method in METHODS
  do (method) ->
    module.exports::[method] = (args...) -> @_callMethod(method, args)