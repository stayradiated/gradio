{exec} = require 'child_process'

task 'server', 'Start server', ->

  require 'coffee-script/register'

  Core   = require './source/core'
  Server = require './source/server'
  Socket = require './source/socket'

  core   = new Core()
  server = new Server(core)

  core.init()
  server.listen(7070)
  Socket.init(server.server, server.app)

  exec('open http://localhost:7070')

