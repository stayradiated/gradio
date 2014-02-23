Promise = require('bluebird')
uuid    = require('uuid')
request = require('request')
fs      = Promise.promisifyAll(require('fs'))
log     = require('log_')('Session', 'blue')

# Where to save downloaded files
tokenPath = __dirname + '/../token.json'

# Assemble url to download
home_url = 'http://grooveshark.com'
preload_php = 'preload.php'
preload_method = 'getCommunicationToken'
preload_url = home_url + '/' + preload_php + '?' + preload_method


class Session

  REFRESH_TIME = 16 * 60 * 1000

  # Defaults
  salt: 'nuggetsOfBaller'
  client:
    name: 'htmlshark'
    revision: '20130520'
  token: null
  country: null
  sessionId: null
  lastUpdated: 0

  constructor: ->
    @uuid = uuid.v1()

  init: =>
    @read().catch(@update)

  update: =>
    fetch(preload_url)
    .then(getSession)
    .then(@import)
    .then(@save)
    .return(this)

  check: =>
    if Date.now() - @lastUpdated > REFRESH_TIME
      return @update()
    Promise.resolve(this)

  import: (data) =>
    @[key] = value for key, value of data
    return this

  read: =>
    fs.readFileAsync(tokenPath)
    .then(JSON.parse)
    .then(@import)

  save: =>
    data = { @lastUpdated, @token, @sessionId, @salt, @country, @client }
    content = JSON.stringify(data, null, 4)
    fs.writeFileAsync(tokenPath, content)


###
 * Get Session Data
###

getSession = (body) ->

  regex = /window.tokenData = (.*);/
  preload = body.match(regex)

  if not preload?
    throw new Error('Could not parse json from preload.php')

  data = JSON.parse(preload[1])

  return {}=
    token: data.getCommunicationToken
    country: data.getGSConfig?.country
    sessionId: data.getGSConfig?.sessionID
    lastUpdated: Date.now()



###
 * Fetch
 *
 * Downloads a file from the internet
 *
 * - urls (string): A single URL
 * > promise > file content
###

fetch = (url) ->

  log 'downloading', url

  deferred = Promise.defer()
  options = { url }
  request options, (err, res, body) ->
    if err then return deferred.reject(err)
    deferred.resolve(body)
  return deferred.promise


module.exports = Session
