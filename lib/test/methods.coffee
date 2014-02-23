should = require('should')
Methods = require('../source/methods')

describe 'Methods', ->

  methods = null

  before (done) ->
    @timeout(5000)
    methods = new Methods()
    methods.core.init()
    .then -> done()
    .done()


  it 'should do something', (done) ->

    methods.songs.popular()
    .progressed (song) ->
      song.should.be.an.Object
    .then (result) ->
      result.should.be.an.Object
      result.result.Songs.should.be.an.Array
    .then -> done()
    .done()

