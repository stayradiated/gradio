sockjs = require('sockjs')
Jandal = require('jandal')
log = require('log_')('Socket', 'blue')

Jandal.handle('node')

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
      @socket.on(event, @[fn])

  callMethod: (method, args) =>
    [partA, partB] = method.split('.')
    fn = @methods[partA]
    if partB then fn = fn[partB]

    fn.apply(null, args).progressed (result) =>
      if result.toJSON? then result = result.toJSON()
      @socket.emit('result', method, result)

module.exports = Socket
