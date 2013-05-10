
App = require './app'
request = require 'request'
http = require 'http'
promise = require 'when'
fs = require 'fs'

module.exports =

  ###*
   * Returns the results of a search from the result of calling Grooveshark's
   * method getSearchResultsEx
   * @param {string} query - Words to search
   * @param {string} type - The type of result you want (Songs, Artists, Albums, Playlists...)
   * @return {object} Json object will all info of the response
  ###
  getSearchResults: (query, type) ->

    parameters =
      query: query
      type: type
      guts: 0
      ppOveride: false

    App.callMethod(parameters, 'getResultsFromSearch')


  ###*
   * Returns the songs of the artist given its ID
   * @param {string} artistId - The ID of the artist
   * @param {int} offset - Displacement of the songs (Starting song)
   * @param {boolean} isVerified - Songs verified or not
   * @return {object} Json object with all info of the response
  ###
  getArtistsSongs: (artistId, offset, isVerified) ->

    parameters =
      offset: offset
      artistID: artistId
      isVerified: isVerified

    App.callMethod(parameters, 'artistGetSongs')


  ###*
   * Returns the songs of the album given its ID
   * @param {string} albumId - ID of the album
   * @param {int} offset - Displacement of the songs (Starting song)
   * @param {boolean} isVerified - Songs verified or not
   * @return {object} Json object with all info the response
  ###
  getAlbumSongs: (albumId, offset, isVerified) ->

    parameters =
      offset: offset
      albumID: albumId
      isVerified: isVerified

    App.callMethod(parameters, 'albumGetSongs')


  ###*
   * Returns the songs of the playlist given its ID
   * @param {string} playlistId - ID of the playlist
   * @param {int} offset - Displacement of the songs (Starting song)
   * @param {boolean} isVerified - Songs verified or not
   * @return {object} Json object with all info the response
  ###
  getPlaylistSongs: (listId, offset=0, isVerified=false) ->

    parameters =
      offset: offset
      playlistID: listId
      isVerified: isVerified

    App.callMethod(parameters, 'playlistGetSongs')

  userGetSongsInLibrary: (userId, page) ->

  ###*
   * Get the users favorites
   * @param {string} userId - The users ID
   * @param {string} ofWhat='Songs' - What you want to get the favorites for (songs, artists)
   * @promises {object} Array of song data
  ###
  getFavorites: (userId, ofWhat='Songs') ->

    parameters =
      userID: userId
      ofWhat: ofWhat

    App.callMethod(parameters, 'getFavorites')


  ###*
   * Returns a list of popular songs
   * @param {string} type - 'monthly', 'weekly' or 'daily'
   * @promises {object} Array of song data
  ###
  getPopularSongs: (type='daily') ->

    parameters =
      type: type

    App.callMethod(parameters, 'popularGetSongs')


  ###*
   * Must be called before retrieving a stream to avoid Grooveshark
   * blacklisting your IP. All the needed params are given by getSongURL
   * @param {string} ip - The IP of the server
   * @param {string} streamKey - The StreamKey for the song
   * @param {int} songId - the ID of the song
   * @promises {boolean} Should return {result: true}
  ###
  markSongAsDownloaded: (ip, streamKey, songId) ->

    parameters =
      streamServerID: ip
      streamKey: streamKey
      songID: songId

    App.callMethod(parameters, 'markSongDownloadedEx')


  ###*
   * Must be called once the stream has finished to avoid Grooveshark
   * blacklisting your IP. All the needed params are given by getSongURL
   * @param {string} ip - The IP of the server
   * @param {string} streamKey - The StreamKey for the song
   * @param {int} songId - the ID of the song
   * @promises {null} Should return {result: null}
  ###
  markSongComplete: (ip, streamKey, songId) ->

    parameters =
      streamServerID: ip
      streamKey: streamKey
      songID: songId

    console.log(parameters)

    App.callMethod(parameters, 'markSongComplete')

  authenticateUser: (username, password) ->

  initiateQueue: ->

  createPlaylist: (playlistName, playlistAbout, ids) ->

  playlistAddSongToExisting: (playlistId, songId) ->

  userAddSongsToLibrary: (songId, songName, albumId, albumName, artistId, artistName, artFilename, trackNum) ->

  favorite: (songId, songName, albumId, albumName, artistId, artistName, artFilename, trackNum) ->

  userGetPlaylists: (userId) ->

  getCountry: ->

  ###*
   * Returns info about where to get the song stream
   * @param {int} songId - The ID of the song
   * @promises {object} cotains streamKey and server IP
  ###
  getSongURL: (songId) ->

    parameters =
      country:
        CC1: 0
        CC2: 0
        CC3: 137438953472
        CC4: 0
        DMA: 0
        ID: 166
        IPR: 0
      songID: songId
      prefetch: false
      mobile: false
      type: 128

    App.callMethod(parameters, 'getStreamKeyFromSongIDEx')


  ###*
   * Returns the song audio stream corresponded to the streamKey passed, it
   * can be used to store it on disk or play it.
   * IMPORTANT!: When using this method markSongAsDownloaded and
   * markSongComplete should be used to avoid Grooveshark heuristics to detect
   * this as an attack.
   * @param {string} ip - The IP of the host where the song is stored
   * @param {string} streamKey - The StreamKey identifies the song
   * @return {stream} Audio stream of the song
  ###
  getSongStream: (ip, streamKey) ->

    deferred = promise.defer()

    contents = 'streamKey=' + streamKey.replace(/_/g, '%5F')

    options =
      hostname: ip
      path: '/' + App.streamphp
      method: 'POST'
      headers:
        'Content-Type': 'application/x-www-form-urlencoded'
        'Content-Length': contents.length
        'Referer': 'http://grooveshark.com/JSQueue.swf?20121003.33'

    req = http.request options, (res) ->
      console.log 'STATUS:', res.statusCode
      console.log 'HEADERS:', res.headers
      body = ""
      res.on 'data', (chunk) ->
        body += chunk.toString('binary')
      res.on 'end', ->
        fs.writeFile('music.mp3', body, encoding: 'binary')
        deferred.resolve()

    req.write(contents)

    req.on 'error', (e) ->
      console.log 'error', e.message

    req.end()

    return deferred.promise


