
should = require('should')
Promise = require('bluebird')
Core = require('../source/core')
RequestFactory = require('../source/request')


describe 'request', ->

  Request = null

  before (done) ->

    core = new Core()
    Request = RequestFactory(core)

    core.init()
    .then -> done()
    .done()

  it ':toString', (done) ->

    parameters = foo: 'bar'
    method = 'helloWorld'

    request = Request(parameters, method)
    request.json.should.eql
      foo: 'bar'

