
SocketIo = require 'socket.io'

class Socket

  @init = (server) ->
    io = SocketIo.listen(server)
    io.set 'log level', 1
    io.sockets.on 'connection', (socket) ->
      console.log 'Got new connection'
      new Socket(socket)
      return true

  events:
    'call': 'callMethod'

  constructor: (@socket) ->
    for event, fn of @events
      @on event, @[fn]

  on: (event, fn) =>
    @socket.on event, fn

  emit: (event, data) =>
    @socket.emit event, data

  callMethod: (data) =>
    console.log 'calling a method'

module.exports = Socket
