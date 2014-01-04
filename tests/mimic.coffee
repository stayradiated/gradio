mimic = require '../source/mimic_flash'

describe 'mimic', ->

  it 'should init', (done) ->
    mimic.init()
      .otherwise (e) ->
        console.log e
      .then ->
        done()
