Promise = require('bluebird')
request = require('request')

home = 'http://tothebestof.com/'
regex = /songIDs\=(\d*\,)*\d*/

BestOf = (methods, createMethod) ->

  methods.getBestOf = (artist) ->

    deferred = Promise.defer()

    options =
      url: home + artist

    request options, (err, res, body) ->
      if err then return deferred.reject err
      ids = body.match(regex)[0][8..].split ','
      deferred.resolve(obj.getSongInfo(ids))

    return deferred.promise


module.exports = BestOf
