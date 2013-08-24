
###

  "SongID": "481871",
  "Name": "Ocean Man",
  "AlbumName": "The Mollusk",
  "AlbumID": "248567",
  "Flags": "0",
  "ArtistName": "Ween",
  "ArtistID": "4211",
  "Year": "1997",
  "CoverArtFilename": "248567.jpg",
  "EstimateDuration": "127",
  "IsVerified": "1",
  "IsLowBitrateAvailable": "1",
  "Popularity": "1313401988",
  "TrackNum": "13",
  "TSAdded": "2013-05-13 18:24:51"

###

class Song

  constructor: (obj) ->

    @SongID = obj.SongID
    @Name = obj.Name
    @AlbumName = obj.AlbumName
    @AlbumID = obj.AlbumID
    @Flags = obj.Flags
    @ArtistName = obj.ArtistName
    @ArtistID = obj.ArtistID
    @Year = obj.Year
    @CoverArtFilename = obj.CoverArtFilename
    @EstimateDuration = obj.EstimateDuration
    @IsVerified = obj.IsVerified
    @IsLowBitrateAvailable = obj.IsLowBitrateAvailable
    @Popularity = obj.Popularity
    @TrackNum = obj.TrackNum
    @TSAdded = obj.TSAdded

  printName: ->
    console.log @ArtistName + ' - ' + @Name

module.exports = Song


