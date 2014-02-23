
###*
 * Starts a web server
 * It's primary purpose is to stream audio data to the client
###

http       = require('http')
url        = require('url')
fs         = require('fs')
formatPath = require('path')
Gradio     = require('../../lib/index')
log        = require('log_')('Server', 'blue')

# TODO: USE EXPRESS

APP_FOLDER = __dirname + '/../../client/app'
MIME_TYPES =
  'html': 'text/html'
  'css': 'text/css'
  'js': 'text/javascript'


notFound = (res) ->
  res.writeHead(404, 'Content-Type': 'text/plain')
  res.write('404. Page not found.')
  res.end()


class Server

  events:
    'fetchSong': /\/song\/([\w\W]+)\.mp3$/

  constructor: ->

    @app = new Gradio()
    @server = http.createServer (req, res) =>

      res.setHeader('Access-Control-Allow-Origin', '*')
      res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With')

      uri = url.parse(req.url).pathname

      # REDIRECT TO APP

      if uri is '/' then uri = '/index.html'

      # STATIC FILE SERVER

      if uri.match(/\.(js|css|html)$/)
        filename = APP_FOLDER + unescape(uri)
        fs.exists filename, (exists) ->
          if not exists then return notFound(res)
          extension = formatPath.extname(filename).split('.')[1]
          res.writeHead 200, 'Content-Type': MIME_TYPES[extension]
          fs.createReadStream(filename).pipe(res)
        return

      # EVENTS

      found = false

      for method, regex of @events
        match = uri.match(regex)
        if match?
          found = true
          @[method](req, res, match)

      if not found
        notFound(res)

  listen: (port) =>
    @server.listen(port)

  # handlers

  fetchSong: (req, res, match) =>

    songID = decodeURIComponent match[1]
    path = "./cache/#{ songID }.mp3"

    log 'downloading song', songID

    # If the client already has a copy of the song in cache, then we just tell
    # it to use it. Mainly because the file is never going to change on the
    # server, so there is no point in resending it.
    if req.headers['if-modified-since']?
      log 'got an if-modified-since'

      modifiedSince = new Date req.headers['if-modified-since']
      if Date.now() - modifiedSince < 1000 * 60 * 60

        headers =
          'Date': new Date().toGMTString()
          'Server': 'Apache/2.2.22 (Ubuntu)'
          'Connection': 'Keep-Alive'
          'Keep-Alive': 'timeout=5, max=100'
          'ETag': '"grooveshark"'

        res.writeHead(304, headers)
        res.end()
        return


    # Check if we have the song in cache ...
    fs.stat path, (err, stats) =>

      if not err
        log 'Loading from disk'

        range = req.headers.range

        unless range?
          log 'no range'
          stream = fs.createReadStream path
          res.writeHead 200,
            'Content-Type': 'audio/mpeg'
          stream.pipe res
          return

        log 'Normal transfer'

        # Get range start and end
        bytes = range.match(/bytes=(\d+)-(\d+)?/)
        rangeStart = parseInt(bytes[1], 10)
        rangeEnd = parseInt(bytes[2], 10)
        if isNaN(rangeEnd) then rangeEnd = stats.size - 1

        stream = fs.createReadStream path,
          start: rangeStart
          end: rangeEnd

        # Generate headers
        total = stats.size
        chunk = rangeEnd - rangeStart + 1
        headers =
          'Date': new Date().toGMTString()
          'Server': 'Apache/2.2.23 (Unix)'
          'Last-Modified': stats.mtime.toGMTString()
          'ETag': '"grooveshark"'
          'Accept-Ranges': 'bytes'
          'Content-Length': chunk
          'Content-Range': "bytes #{ rangeStart }-#{ rangeEnd }/#{total}"
          'Keep-Alive': 'timeout=5, max=100'
          'Connection': 'Keep-Alive'
          'Content-Type': 'audio/mpeg'

        # Send to client
        res.writeHead 206, headers
        stream.pipe res

      else

        # Else download the song from GrooveShark ...
        @app.song.download(songID).then (stream) ->

          # Stream to write to disk
          file = fs.createWriteStream(path)

          # Calculate progress
          total = stream.headers['content-length']
          current = 0
          last = 0

          # Forward the grooveshark headers
          delete stream.headers['cache-control']
          res.writeHead(200, stream.headers)

          stream.on 'data', (chunk) ->
            file.write(chunk)
            res.write(chunk)
            current += chunk.length
            now = Math.round(current/total * 100)
            if now >= last + 5
              last = now

              # trigger some kind of event
              log now

          stream.on 'end', ->
            log 'finished'
            file.end()
            res.end()

module.exports = Server

