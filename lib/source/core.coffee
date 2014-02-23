###
 *
 * Core class
 * ==========
 *
 * Handles the connection to GrooveShark and generating tokens.
 *
###


Promise     = require('bluebird')
obe         = require('oboe')
http        = require('http')
crypto      = require('crypto')
log         = require('log_')('Core', 'green')
Request     = require('./request')
Song        = require('./models/song')
Session     = require('./session')


class Core

  constructor: ->

    # URL Options
    @domain    = 'grooveshark.com'
    @stream_php = 'stream.php'
    @homeurl   = 'http://' + @domain

    # Referers
    @referer = @homeurl + '/'

    # Controllers
    @session = new Session()
    @Request = Request(@session)


  ###
   * Init
   *
   * Connect to grooveshark and get a session going
  ###

  init: ->
    @session.init()
    .then => @getToken()
    .then -> log 'we are online'


  ###
   * Get Token
   *
   * Fetch a token and session from grooveshark
  ###

  getToken: ->
    @session.check().get('token')


  ###
   * Sign Method
   *
   * Generate the TokenKey using the client secret and the method
   * to call a service correctly.
   *
   * - method (string) : the method to sign
   * > promise > string : the method signature
  ###

  signMethod: (method) ->

    @getToken().then (token) =>

      # Generate a random token made of 6 hex digits
      nonce = ''
      while nonce.length < 6
        index = Math.floor(Math.random() * 16)
        nonce += '0123456789abcdef'.charAt(index)

      # Hash the data using SHA1
      data = [method, token, @session.salt, nonce].join(':')
      hash = crypto.createHash('sha1').update(data).digest('hex')

      return nonce + hash


  ###
   * Call Method
   *
   * Uses the token key and session ID to get a response from Grooveshark
   * using the desired method. The parameters must be specified.
   *
   * - method (string): The service to call
   * - parameters (object): Parameters for the method
   * - pattern (string) : the oboe pattern to parse the results
  ###

  callMethod: (method, parameters, pattern) ->

    @signMethod(method).then (token) =>

      request = @Request(method, parameters)
      request.setToken(token)
      request.setPattern(pattern)
      request.start()


  ###
   * Get Song Stream
   *
   * Returns the song audio stream corresponded to the streamKey passed, it
   * can be used to store it on disk or play it.
   * IMPORTANT!: When using this method markSongAsDownloaded and
   * markSongComplete should be used to avoid Grooveshark heuristics to detect
   * this as an attack.
   *
   * - ip (string): The IP of the host where the song is stored
   * - streamKey (string): The StreamKey identifies the song
   * > promise > HTTP stream of the song
  ###

  getSongStream: (ip, streamKey) ->

    deferred = Promise.defer()

    # Generate stream key path
    url = '/' + @stream_php + '?streamKey=' + encodeURIComponent(streamKey)

    options =
      method: 'GET'
      hostname: ip
      path: url
      headers:
        'Connection': 'keep-alive'
        'Cache-Control': 'no-cache'
        'Pragma': 'no-cache'
        'Accept-Encoding': 'identity;q=1, *;q=0'
        'Accept': '*/*'
        'Accept-Language': 'en-US,en;q=0.8'
        'Referer': 'http://grooveshark.com/'
        'Range': 'bytes=0-'

    req = http.request(options, deferred.resolve.bind(deferred))
    req.on('error', log.warn)
    req.end()

    return deferred.promise

module.exports = Core
