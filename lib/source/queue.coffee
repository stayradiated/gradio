###*
 * @fileOverview Handle downloading multiple files, such as a playlist of
 * songs.
###

Promise = require('bluebird')
Methods = require('./methods')

###*
 * @class Queue
###
class Queue

  constructor: (@max, @run) ->
    @queue = []
    @progress = 0

  ###*
   * Add a item (or an array of item) to the queue
   * @param {array|int} songs - The item ID
  ###
  add: (items) ->
    if Array.isArray(items)
      @queue = @queue.concat(items)
    else
      @queue.push(items)

  ###*
   * Remove an item from the queue
  ###
  remove: (index) ->
    @queue.splice(index, 1)

  ###*
   * Continue through all the items in the queue
  ###
  next: =>
    @progress += 1
    if @progress < @queue.length
      @run(@queue[@progress]).then(@next)

  ###*
   * Start a queue running
  ###
  start: =>

    console.log "Running #{@queue.length} times"

    @progress = @max - 1

    for i in [0...@max] by 1
      item = @queue[i]
      @run(item).then(@next)

  ###*
   * Cancel a running queue
   * No idea how to do this at the moment
  ###
  cancel: ->


module.exports = Queue
