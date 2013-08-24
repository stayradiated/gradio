
Core = require '../source/core'
Methods = require '../source/methods'
Song = require '../source/models/song'
assert = require 'assert'

core = new Core()
app = new Methods(core)

describe 'core', ->

  it 'should init', (done) ->

    core.init().then ->
      done()

  it 'should get favorites', (done) ->

    app.userGetSongsInLibrary(20910233).then (response) ->
      done()


