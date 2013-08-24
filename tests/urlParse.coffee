
urlParse = require '../source/urlParse'
assert = require 'assert'

describe 'urlParse', ->

  it 'should only work on known grooveshark urls', ->

    url = urlParse('http://github.com')
    assert.equal url[0], 'err_url'

    url = urlParse('http://grooveshark.com/')
    assert.equal url[0], 'err_url'


  it 'should work on playlists', ->

    url = urlParse('http://grooveshark.com/#!/playlist/1001+60+70/86486712')
    assert.equal url[0], 'playlist'
    assert.equal url[1], '86486712'


  it 'should work on tags', ->

    url = urlParse('http://grooveshark.com/#!/tag/Indie+Rock/3773')
    assert.equal url[0], 'tag'
    assert.equal url[1], '3773'


  it 'should work on artists', ->

    url = urlParse('http://grooveshark.com/#!/artist/The+Beach+Boys/2616')
    assert.equal url[0], 'artist'
    assert.equal url[1], '2616'


  it 'should work on albums', ->

    url = urlParse('http://grooveshark.com/#!/album/Pet+Sounds/143559')
    assert.equal url[0], 'album'
    assert.equal url[1], '143559'


  it 'should work on users', ->

    url = urlParse('http://grooveshark.com/#!/user/David+Billingsley/4275830')
    assert.equal url[0], 'user'
    assert.equal url[1], '4275830'

    url = urlParse('http://grooveshark.com/#!/dcb2124')
    assert.equal url[0], 'username'
    assert.equal url[1], 'dcb2124'


  it 'should work on search terms', ->

    url = urlParse('http://grooveshark.com/#!/search?q=the+beach+boys')
    assert.equal url[0], 'search'
    assert.equal url[1], 'the beach boys'

