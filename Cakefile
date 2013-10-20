task 'server', 'Start server', ->

  Core   = require './source/core'
  Server = require './source/server'
  Socket = require './source/socket'

  core   = new Core()
  server = new Server(core)

  core.init()
  server.listen(8080)
  Socket.init(server.server, server.app)

