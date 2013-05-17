Song = require '../src/models/song'

song = new Song({
  SongID: 1
  Name: 'Alaska'
  ArtistName: 'Robot Science'
})

double = new Song(song)

song.Year = 2013

console.log double
