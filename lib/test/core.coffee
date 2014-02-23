
should = require('should')
Core = require('../source/core')


describe 'core', ->

  core = new Core()

  describe ':init', ->

    it 'should init', (done) ->

      @timeout 10000

      core.init()
      .then -> done()
      .done()

  describe ':getToken', ->

    it 'should get a token', (done) ->

      core.getToken()
      .then (token) ->
        token.should.be.a.String
      .then -> done()
      .done()

  describe ':signMethod', ->

    it 'should sign a method', (done) ->

      core.signMethod('get_all_the_songs')
      .then (hash) ->
        hash.should.be.a.String.and.have.length(46)
      .then -> done()
      .done()

  describe ':callMethod', ->

    it 'should do a search', (done) ->

      @timeout(5000)

      method = 'getResultsFromSearch'
      parameters =
        guts: 0
        ppOverride: false
        query: 'electroswing'
        type: ['Songs']
      pattern = '!.result.result.Songs.*'

      core.callMethod(method, parameters, pattern)
      .progressed (data) ->
        data.should.be.an.Object
        data.SongName.should.be.a.String
      .then (result) ->
        result.header.should.be.an.Object
        result.result.should.be.an.Object
      .then -> done()
      .done()

  describe ':getSongStream', ->

    it 'should get a song stream', (done) ->

      @timeout(5000)

      method = 'getStreamKeyFromSongIDEx'
      parameters =
        country: core.session.country
        mobile: false
        prefetch: false
        songID: 3019126
        type: 1024

      core.callMethod(method, parameters)
      .then (result) ->
        ip = result.result.ip
        streamKey = result.result.streamKey
        core.getSongStream(ip, streamKey)
      .then (stream) ->
        stream.should.be.an.Object
        stream.readable.should.equal(true)
      .then -> done()
      .done()


