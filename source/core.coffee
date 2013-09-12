###
 *
 * Core class
 * ==========
 *
 * Handles the connection to GrooveShark and generating tokens.
 *
 * TODO:
 *   - Load tokens directly from latest GrooveShark JS files
 *
###

request  = require 'request'
Promise  = require 'when'
http     = require 'http'
crypto   = require 'crypto'
uuid     = require 'uuid'
Token    = require '../token.json'
JsonPost = require './jsonPost'
Country  = require './country'


class Core

  # Different methods use different authentication
  methods:
    js: [
      'getStreamKeyFromSongIDEx'
      'markSongComplete'
      'markSongDownloadedEx'
      'markStreamKeyOver30Seconds'
    ]
    html: [
      'getQueueSongListFromSongIDs',
      'getCommunicationToken'
      'getResultsFromSearch'
      'authenticateUser'
      'logoutUser'
      'getPlaylistByID'
      'playlistAddSongToExisting'
      'playlistAddSongToExisting'
      'popularGetSongs'
      'playlistGetSongs'
      'initiateQueue'
      'userAddSongsToLibrary'
      'userGetPlaylists'
      'userGetSongsInLibrary'
      'getFavorites'
      'favorite'
      'getCountry'
      'albumGetSongs'
      'getSongsInfo'
    ]

  constructor: ->

    # URL Options
    @domain    = 'grooveshark.com'
    @methodphp = 'more.php'
    @streamphp = 'stream.php'
    @methodurl = "#{ @domain }/#{ @methodphp }"
    @homeurl   = "http://#{ @domain }"

    # Referers
    @referer =
      js:   "#{ @homeurl }/JSQueue.swf?#{ Token.swfVersion }"
      html: "#{ @homeurl }/"

    @userAgent = 'Mozilla/5.0 (Windows NT 6.1; rv:2.0.1) Gecko/20100101 Firefox/4.0.1'

    # Random UUID
    @uuid = uuid.v1()

    # Keep track of the country
    @country = new Country(this)

    # We need to generate a new token every 16 minutes
    @newTokenTime  = 16 * 60 * 1000
    @lastTokenTime = 0
    @sessionID     = ''
    @secretKey     = ''
    @token         = ''


  ###*
   * Make all the necessary calls to get the session ID and Token
   * Completely optional
   * @promises {null} can be used to do stuff when everything is ready
  ###
  init: =>

    ready = Promise.all [
      @getToken()
      @country.fetch()
    ]

    ready.then ([token]) ->
      console.log '> We are online!'

    return ready


  ###*
   * Returns a Grooveshark SessionID which is needed to communicate with the
   * services and generate the secret key.
   * @promises (string): Grooveshark's SessionID
  ###
  getSessionID: =>

    deferred = Promise.defer()

    # If we already have a valid session ID, use it
    if @sessionID.length > 0
      deferred.resolve @sessionID
      return deferred.promise

    # Else request a new ID from GrooveShark
    request @homeurl, (err, res, body) =>
      if (err) then return deferred.reject(err)
      # Extract session ID from cookies
      cookies = res.headers['set-cookie']
      @sessionID = cookies[0].split('=')[1].split(';')[0]
      deferred.resolve @sessionID

    return deferred.promise


  ###*
   * Generates the SecretKey from the SessionID needed to get the communication
   * Token and returns it.
   * @promises (string): SessionID's SecretKey
  ###
  getSecretKey: =>

    deferred = Promise.defer()

    # If we have already calculated the secret key
    if @secretKey.length > 0
      deferred.resolve @secretKey
      return deferred.promise

    # Else calculate the secret key
    @getSessionID().then (sessionID) =>
      md5 = crypto.createHash('md5')
      md5.update(sessionID, 'utf-8')
      @secretKey = md5.digest('hex')
      deferred.resolve @secretKey

    return deferred.promise


  ###*
   * Returns the communication token needed to communicate with GrooveShark.
   * @promises (string): Communication token
  ###
  getToken: =>

    deferred = Promise.defer()

    timeNow = Date.now()

    # If we have a valid token, use that instead of getting a new one
    if @token.length > 0 and (timeNow - @lastTokenTime) < @newTokenTime
      deferred.resolve @token
      return deferred.promise

    @getSecretKey()
      .then (secretKey) =>
        parameters = secretKey: secretKey
        return @callMethod(parameters, 'getCommunicationToken', 'https')
      .then (response) =>
        @token = response
        @lastTokenTime = timeNow
        deferred.resolve @token

    return deferred.promise


  ###*
   * Generate the TokenKey using Grooveshark's hacked password and the method
   * to call a service correctly.
   * @param  {string} method The service to call
   * @promises {string} The hashed token
  ###
  getTokenKey: (method) =>

    deferred = Promise.defer()

    console.log "Generating key for #{ method }"

    @getToken().then (token) =>

      # Generate a random token made of 6 hex digits
      randomhex = ''
      while 6 > randomhex.length
        pos = Math.floor Math.random() * 16
        randomhex += '0123456789abcdef'.charAt(pos)

      if method in @methods.js
        password = Token.jsToken
        @versionJS = Token.jsVersion

      # TODO: Can we just assume that the token is HTML if it isn't in the JS list?
      else if method in @methods.html
        password = Token.htmlToken
        @versionHTML = Token.htmlVersion

      else
        console.log '[ERROR] method not supported'

      # Hash the data using SHA1
      pass = "#{ method }:#{ token }:#{ password }:#{ randomhex }"
      sha1 = crypto.createHash('sha1')
      hashhex = sha1.update(pass).digest('hex')

      deferred.resolve "#{ randomhex }#{ hashhex }"

    return deferred.promise

  ###*
   * Uses the token key and session ID to get a response from Grooveshark
   * using the desired method. The parameters must be specified.
   * - parameters (object): Parameters for the method
   * - method (string): The service to call
   * - protocol (string): The protocol to use
  ###
  callMethod: (parameters, method, protocol='http') =>

    deferred = Promise.defer()

    start = Date.now()

    # Assemble URL
    url = "#{ protocol }://#{ @methodurl }?#{ method }"

    # Transform parameters and method into a JsonPost object
    new JsonPost(this, parameters, method).then (json) =>

      if method isnt 'getCommunicationToken'
        @getTokenKey(method).then (token) ->
          json.header.token = token
          makeRequest(json)

      else
        makeRequest(json)

    # Runs the request
    makeRequest = (parameters) ->

      console.log "> Calling '#{method}'"

      options =
        url: url
        method: 'POST'
        body: parameters.toString()
        headers:
          'Referer': 'http://grooveshark.com/'

      request options, (err, res, body) ->
        if err then return deferred.reject(err)
        end = Date.now()
        console.log '> ' + (end - start) / 1000 + ' seconds for', method
        try
          results = JSON.parse(body)
          if results.result? then results = results.result
        catch e
          results = body
        deferred.resolve results

    return deferred.promise

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

    deferred = Promise.defer()

    contents = 'streamKey=' + streamKey.replace(/_/g, '%5F')

    options =
      hostname: ip
      path: '/' + @streamphp
      method: 'POST'
      headers:
        'Content-Type': 'application/x-www-form-urlencoded'
        'Content-Length': contents.length
        'Referer': 'http://' + @domain + '/JSQueue.swf?' + @versionSwf

    req = http.request options, (res) ->

      deferred.resolve(res)

      # length = parseInt res.headers['content-length'], 10
      # progress = 0
      # console.log Math.round(length / 1024 / 1024) + 'mb'

      # notify = ->
      #   now = Math.floor(body.length / length * 100)
      #   if now > progress
      #     progress = now
      #     deferred.notify(progress)

      # body = ""
      # res.on 'data', (chunk) ->
      #   body += chunk.toString('binary')
      #   notify()

      # res.on 'end', ->
      #   console.log 'finished download'
      #   deferred.resolve(body)

    req.write(contents)

    req.on 'error', (e) ->
      console.log 'error', e.message

    req.end()

    return deferred.promise

module.exports = Core
