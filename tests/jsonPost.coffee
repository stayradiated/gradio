
Promise = require 'when'
jsonPost = require '../source/jsonPost'
Core = require '../source/core'

core = new Core()

parameters =
  foo: 'bar'

method = 'helloWorld'

describe 'jsonPost', ->

  it 'should init', (done) ->

    Promise.all([
      core.init()
      jsonPost(core, parameters, method)
    ]).then ->
      done()

