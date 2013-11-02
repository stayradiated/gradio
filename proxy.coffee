
util = require 'util'
httpProxy = require 'http-proxy'

server = httpProxy.createServer (req, res, proxy) ->
  console.log '\n-- starting new request --'
  console.log "#{ req.url } :: Request"
  console.log req.headers

  proxy.proxyRequest req, res,
    host: 'localhost'
    port: 8080


server.proxy.on 'proxyResponse', (req, res, response) ->
  console.log '-- finished request --'
  console.log "-- #{ req.url } :: Response #{ response.statusCode }"
  console.log response.headers

server.listen 8081
