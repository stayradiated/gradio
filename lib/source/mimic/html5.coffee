# Get info from the grooveshark files

fs = require 'fs'
request = require 'request'
Promise = require 'when'
log = require('./log')('Mimic', 'blue')

# Where to save downloaded files
folder = __dirname + '/../grooveshark/'

# Where to write token.json to
tokenPath = folder + 'token.json'

# How long to keep downloaded files for
keepFor = 1000 * 60 * 60 * 24 * 3 # 3 days

# Which files to download
file =
  html: 'http://html5.grooveshark.com/index.html'
  js: 'http://html5.grooveshark.com/build/app.min.js'

# HTTP Request headers
module.exports.headers = headers =
  'Referer': 'http://html5.grooveshark.com'
  'Origin': 'http://html5.grooveshark.com'
  'Host': 'html5.grooveshark.com'
  'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; rv:2.0.1) Gecko/20100101 Firefox/4.0.1'

module.exports.methodHeaders = (length) ->
  'Referer': 'http://html5.grooveshark.com'
  'Origin': 'http://html5.grooveshark.com'
  'Host': 'html5.grooveshark.com'
  'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; rv:2.0.1) Gecko/20100101 Firefox/4.0.1'
  'Content-Length': length

# Regexs to extract information
regex =
  country: /"country":(\{[":,\d\w]+\})/
  html5:
    client: /\{client:"(\S*)",clientRevision:"(\d*)"\}/
    pass: /var \S="(\S*)",r=\{faultCodes:/


# -- MAIN FUNCTION ------------------------------------------------------------

module.exports.init = ->
  deferred = Promise.defer()
  fs.exists tokenPath, (exists) ->
    if exists
      log 'loading token.json from disk'
      deferred.resolve require tokenPath

    else
      log 'generating token.json from grooveshark files'
      getFiles([file.html, file.js]).then ([html, js]) ->
        console.log html[1]
        data =
          client:   getClientInfo js[0]
          country:  getCountry    html[0]
          id:       getSessionId  html[1]
        saveFile data
        deferred.resolve data

  return deferred.promise

# -- GET COUNTRY --------------------------------------------------------------

getCountry = (body) ->
  country = body.match(regex.country)[1]
  try
    country = JSON.parse country
  catch err
    log 'WARNING: Could not parse grooveshark html file'
    country = ID: 1, CC1: 0, CC2: 0, CC3: 0, CC4: 0, DMA: 0, IPR: 0
  return country

# -- GET CLIENT INFO ----------------------------------------------------------

getClientInfo = (body) ->
  client = body.match(regex.html5.client)
  salt = body.match(regex.html5.pass)[1]
  return {}=
    name: client[1]
    revision: client[2]
    salt: salt

# -- GET SESSION ID -----------------------------------------------------------

getSessionId = (headers) ->
  cookies = headers['set-cookie']
  return cookies[0].split('=')[1].split(';')[0]

###*
 * Downloads a file from the internet, but also keeps a cache of the file for
 * at least 5 days.
 * - urls (array): An array of multiple URLs
 * - url (string): A single URL
 * > promises the content of the file
###

getFiles = (urls) ->

  if Array.isArray(urls)
    promises = for url in urls
      getFiles(url)
    return Promise.all(promises)
  else
    url = urls

  deferred = Promise.defer()

  # Check if we have already loaded the file
  filename = folder + url.match(/(?!=\/)[^\/]+$/)[0]
  fs.stat filename, (err, stats) ->

    # If the file exists and is new enough
    if stats?.ctime > Date.now() - keepFor

      log 'loading from cache', url

      fs.readFile filename, encoding: 'utf-8', (err, body) ->
        if err then return deferred.reject(err)
        deferred.resolve(body)

    # Else download a copy of the file
    else

      log 'downloading', url

      options =
        url: url
        headers: headers

      request options, (err, res, body) ->
        if err then return deferred.reject(err)
        fs.writeFile(filename, body)
        deferred.resolve([body, res.headers])

  return deferred.promise

# -- GENERATE TOKEN.JSON ------------------------------------------------------

saveFile = (data) ->
  string = JSON.stringify data, null, 4
  fs.writeFile tokenPath, string
