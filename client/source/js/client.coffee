require('./lib/sockjs')
Base     = require('base')
Jandal   = require('jandal/client')
settings = require('./settings')

Jandal.handle('websockets')

class Client extends Jandal

  constructor: ->
    super

    conn = new SockJS("http://#{ settings.host }:#{ settings.port }/ws")
    @connect(conn)

module.exports = Client
