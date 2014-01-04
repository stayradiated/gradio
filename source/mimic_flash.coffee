# Get info from the grooveshark files

fs      = require 'fs'
request = require 'request'
Q       = require 'kew'
log     = require('./log')('Mimic', 'blue')

# Where to save downloaded files
folder = __dirname + '/../grooveshark/'

# Where to write token.json to
tokenPath = folder + 'token.json'

# Which files to download
file =
  html: 'http://grooveshark.com'
  preload: 'http://grooveshark.com/preload.php?getCommunicationToken=1&hash=' + Date.now()

# HTTP Request headers
headers =
  'User-Agent':       'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36'

# User Agent
exports.agent = headers['User-Agent']

# Method headers
exports.methodHeaders = (length) ->
  'Referer': 'http://grooveshark.com'
  'Origin': 'http://grooveshark.com'
  'Host': 'grooveshark.com'
  'User-Agent': exports.agent
  'Content-Length': length

# Regexs to extract information
regex =
  script: /http:\/\/static\.a\.gs-cdn\.net\/static\/app_\d*\.js/

  # These will probably need to be changed often
  salt: /var B="(\w*)",/
  client: /K="(\w*)",/
  revision: /Q="(\d+)",/

  preload:  /window.tokenData = (.*);/


# -- MAIN FUNCTION ------------------------------------------------------------

mData = {}

update = (obj) ->
  for key, value of obj
    mData[key] = value

exports.fetch = ->
  deferred = Q.defer()
  getFiles([file.html, file.preload]).then ([html, preload]) ->
    update getPreload(preload)
    script = getAppScript(html)
    getFiles(script).then (js) ->
      update
        salt: js.match(regex.salt)[1]
        client:
          name: js.match(regex.client)[1]
          revision: js.match(regex.revision)[1]
      deferred.resolve mData
  return deferred.promise

# -- GET APP SCRIPT -----------------------------------------------------------

getAppScript = (html) ->
  script = html.match regex.script
  if not script?
    return console.error 'Error: Could not get app.js script from html'
  return script[0]


# -- GET PRELOAD DATA ---------------------------------------------------------

getPreload = (body) ->
  preload = body.match(regex.preload)
  if not preload?
    return console.error 'Error: Could not get data from preload.php'
  data = JSON.parse preload[1]
  return {}=
    token: data.getCommunicationToken
    country: data.getGSConfig.country
    sessionID: data.getGSConfig.sessionID

###*
 * Downloads a file from the internet
 * - urls (array): An array of multiple URLs
 * - urls (string): A single URL
 * > promises the content of the file
###

getFiles = (urls) ->

  # Handle multiple urls
  if Array.isArray(urls)
    promises = for url in urls
      getFiles(url)
    return Q.all(promises)

  else
    url = urls

  deferred = Q.defer()

  log 'downloading', url

  options =
    url: url
    headers: headers

  request options, (err, res, body) ->
    if err then return deferred.reject err
    deferred.resolve body

  return deferred.promise

# -- GENERATE TOKEN.JSON ------------------------------------------------------

saveFile = (data) ->
  string = JSON.stringify data, null, 4
  fs.writeFile tokenPath, string
