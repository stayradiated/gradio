
Promise = require 'when'
jsonPost = require '../source/jsonPost'
Core = require '../source/core'

core = new Core()

parameters =
  foo: 'bar'

method = 'helloWorld'

describe 'jsonPost', ->
  
  it 'should init', (done) ->
    promise = Promise.all [
      core.init()
      jsonPost(core, parameters, method)
    ]
    promise.then done

