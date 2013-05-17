
Song = require './song'

###*
 * Holds songs
 * Basically just a fancy array
###
class SongList extends Array

  constructor: (songs=[]) ->

    # Make sure each song is an instance of the Song class
    for song in songs
      if song not instanceof Song
        song = new Song(song)
      @push(song)

module.exports = SongList
