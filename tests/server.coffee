
Core = require '../src/core'
Server = require '../src/server'

core = new Core()
server = new Server(core)
server.listen(8080)
