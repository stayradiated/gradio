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

oboe     = require 'oboe'
request  = require 'request'
Promise  = require 'when'
http     = require 'http'
crypto   = require 'crypto'
uuid     = require 'uuid'
jsonPost = require './jsonPost'
Song     = require './models/song'
mimic    = require './mimic'
log      = require('./log')('core', 'green')


class Core

  constructor: ->

    # URL Options
    @domain    = 'grooveshark.com'
    @methodphp = 'more.php'
    @streamphp = 'stream.php'
    @methodurl = "#{ @domain }/#{ @methodphp }"
    @homeurl   = "http://#{ @domain }"

    # Referers
    @referer = "#{ @homeurl }/"

    # Random UUID
    @uuid = uuid.v1()

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

    mimic.init().then (session) =>
      @client  = session.client
      @country = session.country
      @sessionID = session.id

      log '[sessionID]', @sessionID
      @getToken()
        .then (token) ->
          log 'We are online'


  ###*
   * Generates the SecretKey from the SessionID needed to get the communication
   * Token and returns it.
   * @returns (string): SessionID's SecretKey
  ###
  getSecretKey: =>

    # If we have already calculated the secret key
    if @secretKey.length > 0
      return @secretKey

    # Else calculate the secret key
    md5 = crypto.createHash('md5')
    md5.update(@sessionID, 'utf-8')
    @secretKey = md5.digest('hex')
    log '[secretKey]', @secretKey
    return @secretKey


  ###*
   * Returns the communication token needed to communicate with GrooveShark.
   * @promises (string): Communication token
  ###
  getToken: =>

    log '[getToken] start'

    deferred = Promise.defer()

    timeNow = Date.now()

    # If we have a valid token, use that instead of getting a new one
    if @token.length > 0 and (timeNow - @lastTokenTime) < @newTokenTime
      log '[getToken] end (cache)'
      deferred.resolve @token
      return deferred.promise

    parameters = secretKey: @getSecretKey()
    @callMethod(parameters, 'getCommunicationToken', 'https').then (response) =>
      @token = response.result
      @lastTokenTime = timeNow
      log '[getToken] end'
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

    log "[#{ method }] Generating key"

    @getToken().then (token) =>

      # Generate a random token made of 6 hex digits
      randomhex = ''
      while randomhex.length < 6
        pos = Math.floor Math.random() * 16
        randomhex += '0123456789abcdef'.charAt(pos)

      # Hash the data using SHA1
      pass = "#{ method }:#{ token }:#{ @client.salt }:#{ randomhex }"
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

    log "[#{ method }] starting"

    deferred = Promise.defer()

    start = Date.now()

    # Assemble URL
    url = "#{ @methodurl }?#{ method }"

    if protocol is 'https'
      url = "#{ protocol }://#{ url }"

    # Transform parameters and method into a JsonPost object
    json = jsonPost(this, parameters, method)

    log "[#{ method }] Starting request via", protocol

    if method isnt 'getCommunicationToken'
      @getTokenKey(method).then (token) =>
        json.header.token = token
        @makeRequest(url, json, deferred)

    else
      @makeRequest(url, json, deferred)

    return deferred.promise

  # Runs the request
  makeRequest: (url, parameters, deferred) ->
    log '[request]', url

    # Oboe doesn't work with HTTPS
    if url[0..4] isnt 'https'

      params = parameters.toString()
      oboeRequest = oboe.doPost
        url: url
        body: params
        headers: mimic.methodHeaders(params.length)

      oboeRequest.node '!.result.result.*', (result) ->
        deferred.notify new Song(result)

      oboeRequest.node '!.result.Songs.*', (result) ->
        deferred.notify new Song(result)

      oboeRequest.done (result) ->
        deferred.resolve result

      oboeRequest.fail (error) ->
        console.log oboeRequest.root()

    else

      options =
        url: url
        method: 'POST'
        body: parameters.toString()
        headers: mimic.headers

      request options, (err, res, body) ->
        console.log body
        if err then return deferred.reject(err)
        end = Date.now()
        try
          results = JSON.parse body
        catch e
          results = body
        deferred.resolve results

  ###*
   * Returns the song audio stream corresponded to the streamKey passed, it
   * can be used to store it on disk or play it.
   * IMPORTANT!: When using this method markSongAsDownloaded and
   * markSongComplete should be used to avoid Grooveshark heuristics to detect
   * this as an attack.
   * - ip (string): The IP of the host where the song is stored
   * - streamKey (string): The StreamKey identifies the song
   * > HTTP stream of the song
  ###

  getSongStream: (ip, streamKey) ->

    deferred = Promise.defer()

    # Generate stream key path
    url = '/' + @streamphp + '?streamKey=' + streamKey.replace(/_/g, '%5F')

    options =
      hostname: ip
      path: url
      method: 'GET'
      headers:
        'Connection': 'keep-alive'
        'Cache-Control': 'no-cache'
        'Pragma': 'no-cache'
        'Accept-Encoding': 'identity;q=1, *;q=0'
        'User-Agent': mimic.headers['User-Agent']
        'Accept': '*/*'
        'Referer': @referer
        'Accept-Language': 'en-US,en;q=0.8'
        'Referer': 'http://html5.grooveshark.com/'
        'Range': 'bytes=0-'

    req = http.request options, (res) ->
      deferred.resolve(res)

    req.on 'error', (e) ->
      log 'error', e.message

    req.end()

    return deferred.promise

module.exports = Core
