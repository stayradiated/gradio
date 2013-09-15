
generateHeaders = require '../source/jsonPost'
Core = require '../source/core'

core = new Core()

parameters =
  foo: 'bar'

method = 'helloWorld'

core.init().then ->
  generateHeaders(core, parameters, method).then (json) ->
    console.log json

