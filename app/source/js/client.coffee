require './lib/sockjs'
Base     = require 'base'
Promise  = require 'when'
Jandal   = require 'jandal'
settings = require './settings'

Jandal.handle 'sockjs'

METHODS = [
  'getSongInfo',
  'getSearchResults',
  'getArtistsSongs',
  'getAlbumSongs',
  'getPlaylistSongs',
  'getPlaylistByID',
  'getTopBroadcasts',
  'broadcastStatusPoll',
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
  'getSongStream',
  'getBestOf'
]

class Client

  constructor: ->
    @conn = new SockJS "http://#{ settings.host }:#{ settings.port }/ws"
    @socket = new Jandal @conn

  _callMethod: (method, args) =>
    @socket.emit 'call', method, args

for method in METHODS
  do (method) ->
    Client::[method] = (args...) -> @_callMethod(method, args)

module.exports = Client
