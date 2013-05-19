http = require 'http'

server = http.createServer (req, res) ->

  console.log req.url

  res.writeHead 500, 
    "Content-Type": "audio/mpeg"
    "Content-Length": length

  res.write('Hello World')
  res.end()

server.listen(8080)
