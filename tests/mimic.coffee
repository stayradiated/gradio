Core = require '../source/core'
mimic = require '../source/mimic'

core = new Core()
mimic.init(core).then (data) ->
  console.log data

