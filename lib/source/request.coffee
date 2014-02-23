Promise = require('bluebird')
oboe    = require('oboe')
log     = require('log_')('Request', 'magenta')

method_url = 'http://grooveshark.com/more.php?'

###
 * Request
 *
 * Generates the POST headers used for talking to GrooveShark.
 *
 * - session (Session): An instance of the Session class
 * - method (string): The method being called
 * - parameters (object): The parameters you want to send
###


class Request

  constructor: (session, @method, @parameters) ->

    @url = method_url + @method

    @json =
      parameters:        @parameters
      method:            @method
      header:
        client:          session.client.name
        clientRevision:  session.client.revision
        country:         session.country
        privacy:         0
        session:         session.sessionId
        uuid:            session.uuid

  setToken: (token) ->
    @json.header.token = token

  setPattern: (@pattern) ->

  toString: ->
    JSON.stringify(@json, null, 4)

  start: ->

    log '[request]', @url

    deferred = Promise.defer()
    params = @toString()

    request = oboe
      method: 'POST'
      url: @url
      body: params
      headers:
        'Content-Type': 'application/json'
        'Content-Length': params.length

    if @pattern
      request.on 'node', @pattern, (result) ->
        deferred.progress(result)

    request.on 'done', (result) ->
      deferred.resolve(result)

    request.on 'fail', (err, statusCode, body) ->
      log.warn('error', err, statusCode, body)
      deferred.reject(err)

    return deferred.promise


###
 * Request Factory
 *
 * Returns a function that creates a new Request with session pre-defined
 *
 * - session (Session) : instance of the Session class
###

RequestFactory = (session) ->
  return (method, parameters) ->
    return new Request(session, method, parameters)

RequestFactory.Request = Request


module.exports = RequestFactory
