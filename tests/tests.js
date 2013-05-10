
var App = require('../bin/app');
var when = require('when');

// Get a sessionID
App.getSessionID().then(function() {

  console.log('Session ID:', App.sessionid);

  // Get a token
  App.getToken().then(function(token) {

    console.log('Token:', token);

    // Load Groovy
    var Groovy = require('../bin/groovy');

    // Load a playlist
    Groovy.getPlaylistSongs(27734922).then(function(response) {

      // Get the first song in the playlist
      var songId = response.result.Songs[22].SongID;

      // Get the URL for the song
      Groovy.getSongURL(songId).then(function(response) {

        var ip = response.result.ip;
        var streamKey = response.result.streamKey;

        console.log(ip);
        console.log(streamKey);

        // Mark the song as downloaded
        Groovy.markSongComplete(ip, streamKey, songId).then(function(response) {

          console.log(response);

          Groovy.getSongStream(ip, streamKey).then(function() {

            console.log('Sending markSongComplete');

            Groovy.markSongComplete(ip, streamKey, songId).then(function(response) {
              console.log(response);
            });

          });

        });
      });
    });
  });
});;
