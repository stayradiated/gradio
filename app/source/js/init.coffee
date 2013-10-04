window.global =
  port: 8080
  server: 'localhost'

app = require './app.coffee'

# Initialise the app
$ -> app.init()
