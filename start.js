
var Core = require('./bin/core');
var Methods = require('./bin/methods');
var fs = require('fs');

var core = new Core();
var app = new Methods(core);

var _ = {};

function log() {
  var args = 1 <= arguments.length ? [].slice.call(arguments, 0) : [];
  args.unshift('>');
  console.log.apply(console, args);
}

app.getPlaylistSongs(83455835).then(
  function(response) {
    _.song = response.result.Songs[29];
    _.songId = _.song.SongID;
    _.songName = _.song.Name;
    _.songArtist = _.song.ArtistName;
    _.songAlbum = _.song.AlbumName;
    log('Name:', _.songName);
    log('Artist:', _.songArtist);
    log('Album:', _.songAlbum);
    return app.getSongStream(_.songId);
  }
).then(
  function(fileData) {
    log('Downloaded song');
    fs.writeFile('cache/' + _.songArtist  + ' - ' + _.songName +'.mp3', fileData, { encoding: 'binary' });
  },
  null,
  function(pos) {
    var graph = '';
    var i = 0;
    while (i < pos) {
      graph += '=';
      i++
    }
    graph += new Array(100-pos).join(' ');
    process.stdout.write("[" + graph + "] " + pos + "%\r");
  }
)
