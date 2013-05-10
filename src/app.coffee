# Dependencies
request = require 'request'
promise = require 'when'
crypto = require 'crypto'
uuid = require 'uuid'

TokenKey = require './TokenKey'

UUID = randomUUID: ->
  return '1FB2F3AC-6817-4CEE-8819-B4183B1951AF'

class App

  constructor: ->
    @domain = 'grooveshark.com'
    @methodphp = 'more.php' # service.php
    @streamphp = 'stream.php'
    @protocol = 'http' # https
    @homeurl = @protocol + '://' + @domain
    @apiurl = @protocol + '://' + @domain
    @methodurl = @apiurl + '/' + @methodphp
    @jsMethod = [
      'getStreamKeyFromSongIDEx'
      'markSongComplete'
      'markSongDownloadedEx'
      'markStreamKeyOver30Seconds'
    ]
    @htmlMethod = [
      'getCommunicationToken'
      'getResultsFromSearch'
      'authenticateUser'
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
    ]
    @nameHTML = 'htmlshark'
    @nameJS = 'jsqueue'
    @versionHTML = ''
    @versionJS = ''
    @swfversion = '20120124.01'
    @password = ''

    @newTokenTime = 960 # 16 minutes
    @uuid = uuid.v1()

    @sessionid = ''
    @token = ''

  ###*
   * Returns the needed Grooveshark's SessionID to communicate with the
   * services and generate the secret key, it is also stored as an attribute
   * to be used by the other methods.
   * @promises {string} Grooveshark's SessionID
  ###
  getSessionID: =>
    deferred = promise.defer()

    if @sessionid isnt ''
      deferred.resolve(@sessionid)

    else
      request @homeurl, (err, res, body) =>
        cookies = res.headers['set-cookie']
        @sessionid = cookies[0].split('=')[1].split(';')[0]
        deferred.resolve(@sessionid)

    return deferred.promise


  ###*
   * Generates the SecretKey from the SessionID needed to get the communication
   * Token and return s it. If getSessionID() hasn't already been called, it
   * will do it automagically
   * @return SessionID's SecretKey
  ###
  getSecretKey: =>
    md5 = crypto.createHash('md5')
    # DO NOT parse the sessionid as hex
    md5.update(@sessionid, 'utf-8')
    secretKey = md5.digest('hex')
    return secretKey


  ###*
   * Returns the needed Grooveshark's communication Token value to communicate
   * with the services, it is also stored as an attribute to be used by the
   * other methods.
   * @return {string} Token's value
  ###
  getToken: =>
    deferred = promise.defer()
    parameters = secretKey: @getSecretKey()
    @methodurl = 'https' + '://' + @domain + '/' + @methodphp
    @callMethod(parameters, 'getCommunicationToken').then (response) =>
      @methodurl = 'http' + '://' + @domain + '/' + @methodphp
      @token = response.result
      deferred.resolve(@token)
    return deferred.promise


  ###*
   * Generate the TokenKey using Grooveshark's hacked password and the method
   * to call a service correctly.
   * @param  {string} method The service to call
   * @return {string} The token key
  ###
  getTokenKey: (method) =>

    if @token is ''
      return console.error 'Error: no token!'

    randomhex = ''
    while 6 > randomhex.length
      pos = Math.floor Math.random() * 16
      randomhex += "0123456789abcdef".charAt(pos)

    if method in @jsMethod
      @password = TokenKey.jsToken
      @versionJS = TokenKey.jsVersion

    else if method in @htmlMethod
      @password = TokenKey.htmlToken
      @versionHTML = TokenKey.htmlVersion

    pass = method + ':' + @token + ':' + @password + ':' + randomhex

    sha1 = crypto.createHash('sha1')
    hashhex = sha1.update(pass).digest('hex')

    return randomhex + hashhex



  callMethod: (parameters, method) =>

    deferred = promise.defer()

    json = require('./JsonPost')(parameters, method)

    if method isnt 'getCommunicationToken'
      json.header.token = @getTokenKey(method)

    options =
      url: @methodurl + '?' + method
      method: 'POST'
      body: JSON.stringify(json)
      headers:
        'Referer': 'http://grooveshark.com/'

    request options, (err, res, body) ->
      if err then return console.error 'err', err
      deferred.resolve JSON.parse(body)

    return deferred.promise

app = new App()
module.exports = app
