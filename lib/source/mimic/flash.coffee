Promise = require('bluebird')
request = require('request')
fs      = Promise.promisifyAll(require('fs'))
log     = require('log_')('Session', 'blue')

# Where to save downloaded files
tokenPath = __dirname + '/../../token.json'

home_url = 'http://grooveshark.com'
preload_php = 'preload.php'
preload_method = 'getCommunicationToken'
preload_url = home_url + '/' + preload_php + '?' + preload_method


# Method headers
exports.methodHeaders = (length) ->
  'Referer': 'http://grooveshark.com'
  'Origin': 'http://grooveshark.com'
  'Host': 'grooveshark.com'
  'User-Agent': exports.agent
  'Content-Length': length



class Session

  # Defaults
  salt: 'nuggetsOfBaller'
  client:
    name: 'htmlshark'
    revision: '20130520'

  constructor: ->
    log 'making a new session'

  init: =>
    @read().catch(@update).return(this)

  update: =>
    fetch(preload_url).then(getSession).then(@import).then(@save)

  import: (data) =>
    @[key] = value for key, value of data
    return this

  read: =>
    fs.readFileAsync(tokenPath).then(JSON.parse).then(@import)

  save: =>
    data = { @createdAt, @salt, @token, @country, @sessionId, @client }
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
    createdAt: Date.now()



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
