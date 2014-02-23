should  = require('should')
Session = require('../source/session')

describe 'Session', ->

  session = new Session()

  it 'should init', (done) ->

    @timeout(5000)

    session.init()
    .then -> done()
    .done()

  it 'should have loaded properties', ->

    session.salt.should.be.a.String
    session.client.name.should.be.a.String
    session.client.revision.should.be.a.String

    session.token.should.be.a.String
    session.country.should.be.an.Object
    session.sessionId.should.be.a.String
    session.lastUpdated.should.be.a.Number

