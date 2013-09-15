
Core = require '../source/core'
Methods = require '../source/methods'
Song = require '../source/models/song'
assert = require 'assert'

core = new Core()
app = new Methods(core)

describe 'core', ->

  it 'should init', (done) ->

    core.init()
      .then ->
        done()
      .otherwise (err) ->
        throw err

  it 'should get favorites', (done) ->

    console.log '\n\n'

    app.userGetSongsInLibrary(20910233)
      .then (response) ->
        done()
      .otherwise (err) ->
        throw err


