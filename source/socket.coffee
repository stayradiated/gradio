
SocketIo = require 'socket.io'
log = require('./log')('Socket', 'blue')

class Socket

  @init = (server, methods) ->
    io = SocketIo.listen(server)
    io.set 'log level', 1
    io.sockets.on 'connection', (socket) ->
      console.log 'Got new connection'
      new Socket(socket, methods)
      return true

  events:
    'call': 'callMethod'

  constructor: (@socket, @methods) ->
    for event, fn of @events
      @on event, @[fn]

  on: (event, fn) =>
    @socket.on event, fn

  emit: (event, data) =>
    @socket.emit event, data

  callMethod: ([method, args]) =>
    @methods[method].apply(@methods[method], args).then null, null, (result) =>
      @emit 'result', [method, result]

module.exports = Socket
