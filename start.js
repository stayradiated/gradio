
var Core = require('./bin/core');
var Methods = require('./bin/methods');
var SongList = require('./bin/models/songList');
var fs = require('fs');

var core = new Core();
var app = new Methods(core);

var _ = {};

function log() {
  var args = 1 <= arguments.length ? [].slice.call(arguments, 0) : [];
  args.unshift('>');
  console.log.apply(console, args);
}

core.init().then(
  function() {
    console.log('Ready');
    return app.getPlaylistSongs(40354457);
  }
).then(
  function(response) {
    var songs = new SongList(response.Songs);
    _.song = songs[347];
    _.songId = _.song.SongID;
    _.songName = _.song.Name;
    _.songArtist = _.song.ArtistName;
    _.songAlbum = _.song.AlbumName;
    log('ID:', _.songId);
    log('Name:', _.songName);
    log('Artist:', _.songArtist);
    log('Album:', _.songAlbum);
    return app.getSongStream(_.songId);
  }
).then(
  function(fileData) {
    log('\n\nDownload has finished');
    var fileName = './cache/' + _.songArtist + ' - ' + _.songName +'.mp3';
    console.log('Saving ' + fileName);
    fs.writeFile(fileName, fileData, { encoding: 'binary' });
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
