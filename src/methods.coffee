
request = require 'request'
Promise = require 'when'

class Methods

  ###*
   * @params {Core} core - Instance of Core class
  ###
  constructor: (@core) ->

  ###*
   * Returns the results of a search from the result of calling Grooveshark's
   * method getSearchResultsEx
   * @param {string} query - Words to search
   * @param {string} type - The type of result you want (Songs, Artists, Albums, Playlists, Users, Events...)
   * @return {object} Json object will all info of the response
  ###
  getSearchResults: (query, type) ->

    parameters =
      query: query
      type: type
      guts: 0
      ppOveride: false

    @core.callMethod(parameters, 'getResultsFromSearch')


  ###*
   * Returns the songs of the artist given its ID
   * @param {string} artistID - The ID of the artist
   * @param {int} offset - Displacement of the songs (Starting song)
   * @param {boolean} isVerified - Songs verified or not
   * @return {object} Json object with all info of the response
  ###
  getArtistsSongs: (artistID, offset, isVerified) ->

    parameters =
      offset: offset
      artistID: artistID
      isVerified: isVerified

    @core.callMethod(parameters, 'artistGetSongs')


  ###*
   * Returns the songs of the album given its ID
   * @param {string} albumID - ID of the album
   * @param {int} offset - Displacement of the songs (Starting song)
   * @param {boolean} isVerified - Songs verified or not
   * @return {object} Json object with all info the response
  ###
  getAlbumSongs: (albumID, offset=0, isVerified=false) ->

    parameters =
      offset: offset
      albumID: albumID
      isVerified: isVerified

    @core.callMethod(parameters, 'albumGetSongs')


  ###*
   * Returns the songs of the playlist given its ID
   * @param {string} listID - ID of the playlist
   * @param {int} offset - Displacement of the songs (Starting song)
   * @param {boolean} isVerified - Songs verified or not
   * @return {object} Contains playlist song list
  ###
  getPlaylistSongs: (listID, offset=0, isVerified=false) ->

    parameters =
      offset: offset
      playlistID: listID
      isVerified: isVerified

    @core.callMethod(parameters, 'playlistGetSongs')


  ###*
   * Get the songs in a users library
   * @param {int} userID - ID of the user
   * @param {int} page - The page number, use result.hasMore to check for more
  ###
  userGetSongsInLibrary: (userID, page=0) ->

    parameters =
      userID: userID
      page: page

    @core.callMethod(parameters, 'userGetSongsInLibrary')


  ###*
   * Get the users favorites
   * @param {string} userID - The users ID
   * @param {string} ofWhat='Songs' - What you want to get the favorites for (songs, artists)
   * @promises {object} Array of song data
  ###
  getFavorites: (userID, ofWhat='Songs') ->

    parameters =
      userID: userID
      ofWhat: ofWhat

    @core.callMethod(parameters, 'getFavorites')


  ###*
   * Returns a list of popular songs
   * @param {string} type - 'monthly', 'weekly' or 'daily'
   * @promises {object} Array of song data
  ###
  getPopularSongs: (type='daily') ->

    parameters =
      type: type

    @core.callMethod(parameters, 'popularGetSongs')


  ###*
   * Must be called before retrieving a stream to avoid Grooveshark
   * blacklisting your IP. All the needed params are given by getSongURL
   * @param {string} ip - The IP of the server
   * @param {string} streamKey - The StreamKey for the song
   * @param {int} songID - the ID of the song
   * @promises {boolean} Should return {result: true}
  ###
  markSongAsDownloaded: (ip, streamKey, songID) ->

    parameters =
      streamServerID: ip
      streamKey: streamKey
      songID: songID

    @core.callMethod(parameters, 'markSongDownloadedEx')


  markStreamKeyOver30Seconds: (ip, streamKey, songID, artistID) ->

    parameters =
      songQueueID: 0
      songQueueSongID: 0
      streamServerID: ip
      streamKey: streamKey
      artistID: artistID,
      songID: songID

    @core.callMethod(parameters, 'markStreamKeyOver30Seconds')


  ###*
   * Must be called once the stream has finished to avoid Grooveshark
   * blacklisting your IP. All the needed params are given by getSongURL
   * @param {string} ip - The IP of the server
   * @param {string} streamKey - The StreamKey for the song
   * @param {int} songID - the ID of the song
   * @promises {null} Should return {result: null}
  ###
  markSongComplete: (ip, streamKey, songID) ->

    parameters =
      streamServerID: ip
      streamKey: streamKey
      songID: songID

    @core.callMethod(parameters, 'markSongComplete')


  ###*
    * Log the user into GrooveShark
    * TODO: Test this and see if it still works
    * @params {string} username - The username
    * @params {string} password - The password
    * @promises {object} Some data in a JSON object
  ###
  authenticateUser: (username, password) ->

    parameters =
      username: username
      password: password
      savePassword: 1

    @core.callMethod(parameters, 'authenticateUser', 'https')

  logoutUser: ->

    parameters = {}

    @core.callMethod(parameters, 'logoutUser')


  ###*
   * I don't think this is used...
   * I imagine it would start the queue
  ###
  initiateQueue: ->

    parameters = {}

    @core.callMethod(parameters, 'initiateQueue')


  ###*
   * Create a playlist.
   * I assume the user must be logged in for it to work.
   * Haven't tested it though.
   * @params {string} playlistName - The name of the playlist
   * @params {string} playlistAbout - The description
   * @params {array} ids - An array of song IDs to put in the playlist. Can be empty.
  ###
  createPlaylist: (playlistName, playlistAbout, ids) ->

    parameters =
      playlistName: playlistName
      playlistAbout: playlistAbout
      songIDs: ids

    @core.callMethod(parameters, 'createPlaylist')

  ###*
   * Add a song to a playlist.
   * @params {int} listID - The ID of the playlist to add a song to
   * @params {int} songID - The id of the song you want to add
  ###
  playlistAddSongToExisting: (listID, songID) ->

    parameters =
      playlistID: listID
      songID: songID

    @core.callMethod(parameters, 'playlistAddSongToExisting')


  ###*
   * Add a song to the users library collection
  ###
  userAddSongsToLibrary: (songID, songName, albumID, albumName, artistID, artistName, artFilename, trackNum) ->

    songs =
      songID: songID
      songName: songName
      albumID: albumID
      albumName: albumName
      artistID: artistID
      artistName: artistName
      artFilename: artFilename
      track: trackNum

    parameters =
      songs: songs

    @core.callMethod(parameters, 'userAddSongsToLibrary')

  ###*
   * Add a song to the users favorites
  ###
  favorite: (songID, songName, albumID, albumName, artistID, artistName, artFilename, trackNum) ->

    details =
      songID: songID
      songName: songName
      albumID: albumID
      albumName: albumName
      artistID: artistID
      artistName: artistName
      artFilename: artFilename
      track: trackNum

    parameters =
      what: 'Song'
      ID: songID
      details: details

    @core.callMethod(parameters, 'favorite')


  ###*
    * Fetch a users playlists
    * @params {int} userID - The ID of the user
  ###
  userGetPlaylists: (userID) ->

    parameters =
      userID: userID

    @core.callMethod(parameters, 'userGetPlaylists')


  ###*
   * Returns info about where to get the song stream
   * @param {int} songID - The ID of the song
   * @promises {object} cotains streamKey and server IP
  ###
  getSongUrl: (songID) =>

    deferred = Promise.defer()

    @core.country.fetch()

      .then (country) =>

        parameters =
          country: country
          songID: songID
          prefetch: false
          mobile: false
          type: 128

        @core.callMethod(parameters, 'getStreamKeyFromSongIDEx')

      .then deferred.resolve, deferred.reject, deferred.notify

    return deferred.promise


  ###*
   * Download a song. Handles everything, including getting the Stream Key,
   * and calling MarkSongAsDownloaded and MarkSongComplete.
   * @param {int} songID - The ID of the Song
   * @return {stream} Audio stream of the song
  ###
  getSongStream: (songID) =>

    deferred = Promise.defer()

    ip = null
    streamKey = null
    timer = null

    @getSongUrl(songID)
      .then (response) =>
        ip = response.ip
        streamKey = response.streamKey
        past30seconds = false
        timer = setTimeout(->
          console.log '> It has been 30 seconds...'
          past30seconds = true
          @markStreamKeyOver30Seconds(ip, streamKey, songID).then (response) ->
            console.log '\n', response, '\n'
        , 30  * 60 * 1000)
        @markSongAsDownloaded(ip, streamKey, songID)
        @core.getSongStream(ip, streamKey)
      .then (stream) =>
        deferred.resolve(stream)
        stream.on 'end', =>
          clearTimeout(timer)
          if past30seconds then @markSongComplete(ip, streamKey, songID)

    return deferred.promise


module.exports = Methods
