
Queue = require '../src/queue'
Methods = require '../src/methods'
Core = require '../src/core'
Promise = require 'when'
Delay = require 'when/delay'

queue = new Queue 5, (item) ->
  deferred = Promise.defer()
  console.log '>>>', item
  Delay(Math.random() * 5000).then ->
    console.log '---', item
    deferred.resolve()
  return deferred.promise

queue.add(['a', 'b', 'c', 'd', 'e', 'f', 'g'])
queue.add([1, 2, 3, 4, 5, 6, 7])

queue.start()

queue.add(['x', 'y', 'z'])

core = new Core()
methods = new Methods(core)

queue = new Queue(5, methods.getSongStream)
SongList= methods.getPlaylistSongs('playlistid')
queue.add(SongList)
queue.start()
