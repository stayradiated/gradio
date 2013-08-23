METHODS = [
  'getSearchResults',
  'getArtistsSongs',
  'getAlbumSongs',
  'getPlaylistSongs',
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

callMethod = (method, args) ->
  $.ajax
    method: 'post'
    url: "http://#{global.server}:#{global.port}/#{method}"
    data: JSON.stringify(args)

# Probably not the most efficient way of doing this
for method in METHODS
  do (method) ->
    module.exports.prototype[method] = (args...) ->
      callMethod(method, args)
