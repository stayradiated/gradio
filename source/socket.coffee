sockjs = require 'sockjs'
Jandal = require 'jandal'
log = require('./log')('Socket', 'blue')

Jandal.handle 'node'

class Socket

  @init = (server, methods) ->
    conn = sockjs.createServer()
    conn.installHandlers server, prefix: '/ws'
    conn.on 'connection', (socket) ->
      jandal = new Jandal(socket)
      new Socket(jandal, methods)

  events:
    'call': 'callMethod'

  constructor: (@socket, @methods) ->
    for event, fn of @events
      @on event, @[fn]

  on: (event, fn) =>
    @socket.on event, fn

  emit: (event, data) =>
    if data.toJSON? then data = data.toJSON()
    @socket.emit event, data

  callMethod: (method, args) =>
    @methods[method].apply(@methods[method], args).then null, null, (result) =>
      @emit 'result', [method, result]

module.exports = Socket
