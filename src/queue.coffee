###*
 * @fileOverview Handle downloading multiple files, such as a playlist of
 * songs.
*###

Methods = require './methods'

###*
 * @class Queue
*###
class Queue

  constructor: (@core) ->
    @queue = []

  add: (songs) ->
    @queue = @queue.concat(songs)

  start: ->

  cancle: ->

module.exports = Queue
