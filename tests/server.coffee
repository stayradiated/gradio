
Core = require '../source/core'
Server = require '../source/server'

core = new Core()
server = new Server(core)
server.listen(8080)
