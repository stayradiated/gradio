Promise = require('bluebird')
log = require('log_')('Methods -> Download', 'green')


THIRTY_SECONDS = 30  * 60 * 1000
delay = (time, fn) -> setTimeout(fn, time)


Download = (methods, createMethod) ->


  markStreamKeyOver30Seconds = createMethod
    name: 'markStreamKeyOver30Seconds '
    parameters: (ip, streamKey, songId) ->
      songID: songId
      streamKey: streamKey
      streamServerID: ip

  markSongAsDownloaded = createMethod
    name: 'markSongDownloadedEx'
    parameters: (ip, streamKey, songId) ->
      songID: songId
      streamKey: streamKey
      streamServerID: ip

  markSongCompleted = createMethod
    name: 'markSongCompleted'
    parameters: (ip, streamKey, songId) ->
      songID: songId
      streamKey: streamKey
      streamServerID: ip


  # Make sure the namespace exists
  methods.song ?= {}


  ###
   * Get Song URL
   *
   * Returns info about where to get the song file from
   *
   * - songId (number) : id of the song
   * > promise > object
  ###

  methods.song.getUrl = createMethod
    name: 'getStreamKeyFromSongIDEx'
    parameters: (songId) ->
      country: methods.core.session.country
      songID: songId
      prefetch: false
      mobile: false
      type: 1024

  ###
   * Download Song
   *
   * Download a song from grooveshark.
   * Calls the appropriate methods to make sure that GrooveShark doesn't
   * ban us for misusing their api.
   *
   * - songId (number) : id of the song to download
   * > promise > stream
  ###

  methods.song.download = (songId) ->

    ip = null
    streamKey = null
    timer = null
    past30seconds = false

    methods.song.getUrl(songId)
    .then (response) ->

      {ip, streamKey} = response.result

      log {ip, streamKey}

      timer = delay THIRTY_SECONDS, ->
        log '> It has been 30 seconds...'
        past30seconds = true
        markStreamKeyOver30Seconds(ip, streamKey, songId)

      markSongAsDownloaded(ip, streamKey, songId)
      methods.core.getSongStream(ip, streamKey)

    .then (stream) ->

      stream.on 'end', ->
        clearTimeout(timer)

        if past30seconds
          markSongComplete(ip, streamKey, songId)

      return stream


module.exports = Download
