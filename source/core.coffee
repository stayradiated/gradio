###*
 * @fileOverview Used to make requests to the internal Grooveshark API
###

# Dependencies
request = require 'request'
promise = require 'when'
http = require 'http'
crypto = require 'crypto'
uuid = require 'uuid'
Token = require './token'
JsonPost = require './jsonPost'
Country = require './country'

###*
 * @class Core
###

class Core

  constructor: ->

    # URL Options
    @domain = 'grooveshark.com'
    @methodphp = 'more.php'
    @streamphp = 'stream.php'
    @methodurl = @domain + '/' + @methodphp
    @homeurl = 'http://' + @domain

    # JS and HTML methods use different tokens
    @jsMethod = [
      'getStreamKeyFromSongIDEx'
      'markSongComplete'
      'markSongDownloadedEx'
      'markStreamKeyOver30Seconds'
    ]
    @htmlMethod = [
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
    @htmlName = 'htmlshark'
    @jsName = 'jsqueue'
    @htmlVersion = ''
    @jsVersion = ''
    @swfVersion = '20121003.33'
    @password = ''

    # Referers
    @jsReferer = 'http://grooveshark.com/JSQueue.swf?' + @swfVersion
    @htmlReferer = 'http://grooveshark.com/'
    @userAgent = 'Mozilla/5.0 (Windows NT 6.1; rv:2.0.1) Gecko/20100101 Firefox/4.0.1'

    # Random UUID
    @uuid = uuid.v1()

    # Keep track of the country
    @country = new Country(this)

    # We need to generate a new token every 16 minutes
    @newTokenTime = 16 * 60 * 1000
    @lastTokenTime = 0
    @sessionID = ''
    @secretKey = ''
    @token = ''


  ###*
   * Make all the necessary calls to get the session ID and Token
   * Completely optional
   * @promises {null} can be used to do stuff when everything is ready
  ###
  init: =>

    ready = promise.all([
      @getToken()
      @country.fetch()
    ])

    ready.then ->
      console.log '> We are online!'

    return ready


  ###*
   * Returns a Grooveshark SessionID which is needed to communicate with the
   * services and generate the secret key.
   * @promises {string} Grooveshark's SessionID
  ###
  getSessionID: =>

    deferred = promise.defer()

    # If we already have a valid session ID, use it
    if @sessionID.length > 0
      deferred.resolve(@sessionID)
      return deferred.promise

    console.log '> Getting session id'
    start = Date.now()

    # Else request a new ID from GrooveShark
    request @homeurl, (err, res, body) =>
      end = Date.now()
      console.log (end - start) / 1000, 'seconds'
      if (err) then return deferred.reject(err)
      cookies = res.headers['set-cookie']
      @sessionID = cookies[0].split('=')[1].split(';')[0]
      deferred.resolve(@sessionID)

    return deferred.promise


  ###*
   * Generates the SecretKey from the SessionID needed to get the communication
   * Token and return s it. If getSessionID() hasn't already been called, it
   * will do it automagically
   * @promises {string} SessionID's SecretKey
   * @throws Error if it can't get a session ID
  ###
  getSecretKey: =>

    deferred = promise.defer()

    # If we have already calculated the secret key
    if @secretKey.length > 0
      deferred.resolve(@secretKey)
      return deferred.promise

    # Get the session ID
    @getSessionID().then(
      (sessionID) =>
        console.log '> Getting secret key'
        md5 = crypto.createHash('md5')
        md5.update(sessionID, 'utf-8')
        @secretKey = md5.digest('hex')
        deferred.resolve(@secretKey)
    ,
      (err) ->
        throw new Error(err)
    )

    return deferred.promise


  ###*
   * Returns the communication token needed to communicate with GrooveShark.
   * @promises {string} Communication token
  ###
  getToken: =>

    deferred = promise.defer()

    timeNow = Date.now()

    # If we have a valid token, use that instead of getting a new one
    if @token.length > 0 and (timeNow - @lastTokenTime) < @newTokenTime
      deferred.resolve(@token)
      return deferred.promise

    @getSecretKey().then(
      (secretKey) =>
        console.log '> Getting token'
        parameters = secretKey: secretKey
        return @callMethod(parameters, 'getCommunicationToken', 'https')
    ).then(
      (response) =>
        @token = response
        @lastTokenTime = timeNow
        deferred.resolve(@token)
    )

    return deferred.promise


  ###*
   * Generate the TokenKey using Grooveshark's hacked password and the method
   * to call a service correctly.
   * @param  {string} method The service to call
   * @promises {string} The hashed token
  ###
  getTokenKey: (method) =>

    deferred = promise.defer()

    @getToken().then (token) =>

      console.log '> Getting token key'

      randomhex = ''
      while 6 > randomhex.length
        pos = Math.floor Math.random() * 16
        randomhex += "0123456789abcdef".charAt(pos)

      if method in @jsMethod
        @password = Token.jsToken
        @versionJS = Token.jsVersion

      else if method in @htmlMethod
        @password = Token.htmlToken
        @versionHTML = Token.htmlVersion

      pass = method + ':' + token + ':' + @password + ':' + randomhex

      sha1 = crypto.createHash('sha1')
      hashhex = sha1.update(pass).digest('hex')

      deferred.resolve(randomhex + hashhex)

    return deferred.promise

  ###*
   * Uses the token key and session ID to get a response from Grooveshark
   * using the desired method. The parameters must be specified.
   * @param {object} parameters - Parameters for the method
   * @param {string} method - The service to call
   * @param {string} protocol - The protocol to use
   * @promises {object} The JSON data returned from the request
  ###
  callMethod: (parameters, method, protocol='http') =>

    deferred = promise.defer()

    start = Date.now()

    # Assemble URL
    url = protocol + '://' + @methodurl + '?' + method

    # Run the request
    makeRequest = (json) ->

      console.log "> Calling '#{method}'"

      options =
        url: url
        method: 'POST'
        body: json.toString()
        headers:
          'Referer': 'http://grooveshark.com/'

      request options, (err, res, body) ->
        if err then return deferred.reject(err)
        end = Date.now()
        console.log '> ' + (end - start) / 1000 + ' seconds'
        try
          json = JSON.parse(body)
          if json.result? then json = json.result
        catch e
          json = body
        deferred.resolve(json)

    # Transform parameters and method into a JsonPost object
    new JsonPost(this, parameters, method).then (json) =>

      if method isnt 'getCommunicationToken'
        @getTokenKey(method).then (token) ->
          json.header.token = token
          makeRequest(json)

      else
        makeRequest(json)

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

    deferred = promise.defer()

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
