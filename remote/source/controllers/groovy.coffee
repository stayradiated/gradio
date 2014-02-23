require('../vendor/sockjs-0.3.4.min.js')
Jandal = require('jandal/client')

Jandal.handle('websockets')

client = new Jandal()

client.init = (url) ->
  client.connect(new SockJS(url))

module.exports = client
