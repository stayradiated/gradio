
var App = require('./bin/core');
var when = require('when');
var fs = require('fs');

var _ = {};

function log() {
  var args = 1 <= arguments.length ? [].slice.call(arguments, 0) : [];
  args.unshift('>');
  console.log.apply(console, args);
}

App.getSessionID().then(
  function() {
    log('Session ID:', App.sessionid);
    return App.getToken();
  }
).then(
  function(token) {
    log('Token:', token);
    _.Groovy = require('./bin/groovy');
    return _.Groovy.getPlaylistSongs(27734922);
  },
  function(err) {
    log(err)
  }
).then(
  function(response) {
    log('Got playlist');
    _.song = response.result.Songs[8];
    _.songId = _.song.SongID;
    _.songName = _.song.Name;
    _.songArtist = _.song.ArtistName;
    _.songAlbum = _.song.AlbumName;
    return _.Groovy.getSongURL(_.songId);
  },
  function(err) {
    log(err)
  }
).then(
  function(response) {
    log('Got song URL');
    _.ip = response.result.ip;
    _.streamKey = response.result.streamKey;
    return _.Groovy.markSongAsDownloaded(_.ip, _.streamKey, _.songId);
  },
  function(err) {
    log(err)
  }
).then(
  function() {
    log('Marked song as downloaded');
    return _.Groovy.getSongStream(_.ip, _.streamKey);
  },
  function(err) {
    log(err)
  }
).then(
  function(fileData) {
    log('Downloaded song');
    fs.writeFile('cache/' + _.songArtist  + ' - ' + _.songName +'.mp3', fileData, { encoding: 'binary' });
    return _.Groovy.markSongComplete(_.ip, _.streamKey, _.songId);
  },
  function(err) {
    log(err)
  },
  function(pos) {
    console.log(pos);
  }
).then(
  function() {
    log('Marked song as completed');
  },
  function(err) {
    log(err)
  }
);
