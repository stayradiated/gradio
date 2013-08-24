
SongList = require '../source/models/songList'

list = new SongList([{
  SongID: 0
  ArtistName: 'Coldplay'
  Name: 'Viva la Vida'
}])

console.log list
list[0].printName()
