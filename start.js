
var Core = require('./bin/core');
var Methods = require('./bin/methods');
var SongList = require('./bin/models/songList');

var http = require('http');
var fs = require('fs');

var core = new Core();
var app = new Methods(core);

var _ = {};

// Map console.log to log
function log = console.log.bind(console);

// Connect to Grooveshark
core.init().then(
  function() {
    return app.getPlaylistSongs(40354457);
  }
).then(
  function(response) {
    var songs = new SongList(response.Songs);
    _.song = songs[348];
    _.songId = _.song.SongID;
    _.songName = _.song.Name;
    _.songArtist = _.song.ArtistName;
    _.songAlbum = _.song.AlbumName;
    log('ID:', _.songId);
    log('Name:', _.songName);
    log('Artist:', _.songArtist);
    log('Album:', _.songAlbum);
  }
)
// .then(
//   function(fileData) {
//     log('\n\nDownload has finished');
//     var fileName = './cache/' + _.songArtist + ' - ' + _.songName +'.mp3';
//     console.log('Saving ' + fileName);
//     fs.writeFile(fileName, fileData, { encoding: 'binary' });
//   },
//   null,
//   function(pos) {
//     var graph = '';
//     var i = 0;
//     while (i < pos) {
//       graph += '=';
//       i++
//     }
//     graph += new Array(100-pos).join(' ');
//     process.stdout.write("[" + graph + "] " + pos + "%\r");
//   }
// )


http.createServer(function(req, res) {

  console.log('Got http request');

  if (req.url.slice(-4) === '.mp3') {

    app.getSongStream(_.songId).then(function(stream) {

      console.log('Got stream request');

      var length = stream.headers['content-length'];
      console.log(length);

      res.writeHead(200, {
        "Content-Type": "audio/mpeg",
        "Content-Length": length
      });

      stream.on('data', function(chunk) {
        res.write(chunk);
      });

      stream.on('end', function() {
        console.log('Finished!');
        res.end();
      })

    });

  } else {

    res.write('404');
    res.end();

  }

}).listen(8080);
