
###*
 * Starts a web server
 * It's primary purpose is to stream audio data to the client
###

http = require 'http'
url = require 'url'
fs = require 'fs'
Methods = require './methods'

class Server

  events:
    'fetchSong': /\/song\/([\w\W]+)\.mp3$/

  constructor: (@core) ->

    @app = new Methods(@core)

    # Extend all methods as POST requests
    for method of Methods.prototype
      @events[method] = new RegExp("\\/#{method}")
      do (method) =>
        @[method] = (req, res) =>
          req.setEncoding('utf8')
          data = ''
          req.on 'data', (chunk) ->
            data += chunk
          req.on 'end', =>
            args = JSON.parse data
            @app[method](args...).then (results) ->
              res.write JSON.stringify(results)
              res.end()

    @server = http.createServer (req, res) =>

      res.setHeader 'Access-Control-Allow-Origin', '*'
      res.setHeader 'Access-Control-Allow-Headers', 'X-Requested-With'

      uri = url.parse(req.url).pathname
      found = false

      for method, regex of @events
        match = uri.match(regex)
        if match?
          found = true
          @[method](req, res, match)

      if not found
        res.writeHead(404, 'Content-Type': 'text/plain')
        res.write('404. Page not found.')
        res.end()

  listen: (port) =>
    @server.listen(port)

  # handlers

  fetchSong: (req, res, match) =>

    songID = decodeURIComponent(match[1])
    path = "./cache/#{ songID }.mp3"

    # If the client already has a copy of the song in cache, then we just tell
    # it to use it. Mainly because the file is never going to change on the
    # server, so there is no point in resending it.
    if req.headers['if-modified-since']?

      console.log '> got an if-modified-since'

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
    fs.exists path, (exists) =>

      console.log path, exists

      if exists
        console.log '> Loading from disk'

        # Load file from disk
        fs.readFile path, (err, file) ->

          range = req.headers.range

          unless range?
            console.log '> no range'
            res.writeHead 200,
              'Content-Type': 'audio/mpeg'
            res.end(file)
            return

          console.log '> Normal transfer'

          # Get range start and end
          bytes = range.match(/bytes=(\d+)-(\d+)?/)
          ini = parseInt(bytes[1], 10)
          end = parseInt(bytes[2], 10)
          if isNaN(end) then end = file.length - 1

          # Generate headers
          total = file.length
          chunk = end - ini + 1
          headers =
            'Date': new Date().toGMTString()
            'Server': 'Apache/2.2.22 (Ubuntu)'
            'Last-Modified': new Date('5/10/2013').toGMTString()
            'ETag': '"grooveshark"'
            'Accept-Ranges': 'bytes'
            'Content-Length': chunk
            'Content-Range': "bytes #{ini}-#{end}/#{total}"
            'Keep-Alive': 'timeout=5, max=100'
            'Connection': 'Keep-Alive'
            'Content-Type': 'audio/mpeg'

          # Send to client
          res.writeHead(206, headers)
          res.end(file)

      else

        # Else download the song from GrooveShark ...
        @app.getSongStream(songID).then (stream) ->

          # Stream to write to disk
          file = fs.createWriteStream(path)

          # Calculate progress
          total = stream.headers['content-length']
          current = 0
          last = 0

          # Forward the grooveshark headers
          delete stream.headers['cache-control']
          res.writeHead(200, stream.headers);

          stream.on 'data', (chunk) ->
            file.write(chunk)
            res.write(chunk)
            current += chunk.length
            now = Math.round(current/total * 100)
            if now > last + 5
              last = now

              # trigger some kind of event
              console.log now

          stream.on 'end', ->
            console.log 'finished'
            file.end()
            res.end()

module.exports = Server

