app = require './app.coffee'
window.SocketIo = require './lib/socket.io'

# Initialise the app
$ -> app.init()
