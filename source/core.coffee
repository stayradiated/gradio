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

Q        = require 'when'
oboe     = require 'oboe'
request  = require 'request'
http     = require 'http'
crypto   = require 'crypto'
uuid     = require 'uuid'
jsonPost = require './jsonPost'
Song     = require './models/song'
mimic    = require './mimic_flash'
log      = require('./log')('Core', 'green')


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


  init: =>
    @getToken().then ->
      log 'we are online'

  getToken: =>

    now = Date.now()

    if now - @lastTokenTime < @newTokenTime
      return Q.resolve @token

    deferred = Q.defer()

    mimic.fetch().then (data) =>
      @lastTokenTime = now
      @[key] = value for key, value of data
      deferred.resolve @token

    return deferred.promise



  ###*
   * Generate the TokenKey using the client secret and the method
   * to call a service correctly.
   * @param  {string} method The service to call
   * @promises {string} The hashed token
  ###
  getTokenKey: (method) =>

    log "[#{ method }] Generating key"

    @getToken().then (token) =>

      # Generate a random token made of 6 hex digits
      randomhex = ''
      while randomhex.length < 6
        pos = Math.floor Math.random() * 16
        randomhex += '0123456789abcdef'.charAt(pos)

      # Hash the data using SHA1
      pass = "#{ method }:#{ @token }:#{ @salt }:#{ randomhex }"
      sha1 = crypto.createHash('sha1')
      hashhex = sha1.update(pass).digest('hex')

      return "#{ randomhex }#{ hashhex }"

  ###*
   * Uses the token key and session ID to get a response from Grooveshark
   * using the desired method. The parameters must be specified.
   * - parameters (object): Parameters for the method
   * - method (string): The service to call
   * - protocol (string): The protocol to use
  ###
  callMethod: (parameters, method, pattern, protocol='http') =>

    deferred = Q.defer()
    start = Date.now()

    # Assemble URL
    if pattern? and protocol isnt 'https'
      url = "#{ @methodurl }?#{ method }"
    else
      url = "#{ protocol }://#{ @methodurl }?#{ method }"

    # Transform parameters and method into a JsonPost object
    json = jsonPost(this, parameters, method)

    log "[#{ method }] Starting request via", protocol

    @getTokenKey(method).then (token) =>
      json.header.token = token
      @makeRequest(url, json, pattern, deferred)

    return deferred.promise

  # Runs the request
  makeRequest: (url, parameters, pattern, deferred) ->
    log '[request]', url

    params = parameters.toString()

    # Oboe doesn't work with HTTPS
    if url[0..4] isnt 'https'

      log '[request] using oboe'

      oboeRequest = oboe.doPost
        url: url
        body: params
        headers: mimic.methodHeaders(params.length)

      oboeRequest.node pattern, (result) ->
        deferred.notify result

      oboeRequest.done (result) ->
        deferred.resolve result

      oboeRequest.fail (error) ->
        console.log 'error', oboeRequest.root()

    else

      log '[request] using request'

      options =
        url: url
        method: 'POST'
        body: params
        headers: mimic.headers

      request options, (err, res, body) ->
        if err then return deferred.reject(err)
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

    deferred = Q.defer()

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
        'User-Agent': mimic.agent
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
