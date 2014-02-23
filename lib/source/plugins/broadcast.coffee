Broadcast = (core, createMethod) ->

  # Make sure namespace exists
  core.broadcast ?= {}

  ###
   * Top Broadcasts
   *
   * Get a list of the top broadcasts
  ###

  core.broadcast.top = createMethod
    name: 'getTopBroadcastsCombined'
    pattern: '!.result.*'
    parameters: {}


  ###
   * Poll Broadcast
   *
   * Check the status of a broadcast
  ###

  core.broadcast.poll = createMethod
    name: 'broadcastStatusPoll'
    pattern: '!.result'
    parameters: (broadcastId) ->
      broadcastID: broadcastId


module.exports = Broadcast
