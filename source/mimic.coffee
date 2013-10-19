# Get info from the grooveshark files

fs = require 'fs'
request = require 'request'
Promise = require 'when'

# Where to save downloaded files
folder = __dirname + '/../pages/'

# Where to write token.json to
tokenPath = folder + 'token.json'

# How long to keep downloaded files for
keepFor = 1000 * 60 * 60 * 24 * 5 # 5 days

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
  fs.stat tokenPath, (err, stats) ->
    if stats?
      deferred.resolve require(tokenPath)
    else
      files = getFiles([file.html, file.js])
      files.then ([html, js]) ->
        data =
          client:   getClientInfo(js)
          country:  getCountry(html)
        saveFile(data)
        deferred.resolve(data)
  return deferred.promise

# -- GET COUNTRY --------------------------------------------------------------

getCountry = (body) ->
  country = body.match(regex.country)[1]
  try
    country = JSON.parse country
  catch err
    console.log 'WARNING: Could not parse grooveshark html file'
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

# -- GET FILES ----------------------------------------------------------------

getFiles = (urls) ->

  if Array.isArray(urls)
    promises = for url in urls
      getFiles(url)
    return Promise.all(promises)
  else
    url = urls

  deferred = Promise.defer()

  filename = folder + url.match(/(?!=\/)[^\/]+$/)[0]

  # Check if we have already loaded the file
  fs.stat filename, (err, stats) ->

    # If the file exists and is new enough
    if stats?.ctime > Date.now() - keepFor
      fs.readFile filename, encoding: 'utf-8', (err, body) ->
        if err then return deferred.reject(err)
        deferred.resolve(body)

    # Else download a copy of the file
    else

      console.log 'downloading file', url

      options =
        url: url
        headers: headers

      request options, (err, res, body) ->
        if err then return deferred.reject(err)
        fs.writeFile(filename, body)
        deferred.resolve(body)

  return deferred.promise

# -- GENERATE TOKEN.JSON ------------------------------------------------------

saveFile = (data) ->
  string = JSON.stringify data, null, 4
  fs.writeFile tokenPath, string
