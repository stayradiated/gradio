
var Core = require('./bin/core');
var Queue = require('./bin/queue');
var Methods = require('./bin/methods');
var SongList = require('./bin/models/songList');

var fs = require('fs');
var when = require('when');

var core = new Core();
var app = new Methods(core);

var _ = {};

var config = {
  id: 87558723,
  type: 'playlist'
};

// Map console.log to log
function log = console.log.bind(console);

// There seems to be a problem with downloads getting corrupted.
// Not sure why that happens. Will need to look into it
var queue = new Queue(1, function(song) {
  var deferred = when.defer();

  songId = song.SongID;
  songName = song.Name;
  songArtist = song.ArtistName;
  songAlbum = song.AlbumName;

  log('\n');
  log('ID:', songId);
  log('Name:', songName);
  log('Artist:', songArtist);
  log('Album:', songAlbum);

  if (songId === undefined) {
    console.log(song);
  }

  app.getSongStream(songId).then(function(stream) {
    console.log('Got stream');
    var path = 'dl/' + songArtist + ' - ' + songName + '.mp3';
    var file = fs.createWriteStream(path);
    stream.on('data', function(chunk) {
      file.write(chunk);
    });
    stream.on('end', function() {
      file.end();
      deferred.resolve();
    });
  }).otherwise(function(err) {
    throw err;
  });

  return deferred.promise;
});

core.init().then(
  function() {
    console.log('> Groovy is ready!');
    switch ( config.type ){
      case 'playlist':
        return app.getPlaylistSongs( config.id );
      case 'album':
        return app.getAlbumSongs( config.id );
    }
  }
).then(
  function(response) {
    switch ( config.type ) {
      case 'playlist':
        var songs = response.Songs;
        break;
      case 'album':
        var songs = [];
        for (var id in response.songs) {
          if (response.songs.hasOwnProperty(id) && id !== 'length') {
            songs.push(response.songs[id]);
          }
        }
        break;
    }
    queue.add(songs);
    queue.start();
  }
);
