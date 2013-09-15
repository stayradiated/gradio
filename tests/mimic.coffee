Core = require '../source/core'
mimic = require '../source/mimic'

core = new Core()

describe 'mimic', ->

  it 'should init', (done) ->
    mimic.init(core).then done
