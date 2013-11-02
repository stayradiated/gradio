
class Song

  constructor: (obj) ->

    @SongID                 = obj.SongID
    @ArtistID               = obj.ArtistID
    @AlbumID                = obj.AlbumID

    @SongName               = obj.SongName or obj.Name
    @AlbumName              = obj.AlbumName
    @ArtistName             = obj.ArtistName

    @Year                   = obj.Year
    @TrackNum               = obj.TrackNum

    @CoverArtFilename       = obj.CoverArtFilename
    @ArtistCoverArtFilename = obj.ArtistCoverArtFilename

    @TSAdded                = obj.TSAdded
    @AvgRating              = obj.AvgRating
    @AvgDuration            = obj.AvgDuration
    @EstimateDuration       = obj.EstimateDuration

    @Flags                  = obj.Flags
    @IsLowBitrateAvailable  = obj.IsLowBitrateAvailable
    @IsVerified             = obj.IsVerified

    @Popularity             = obj.Popularity
    @Score                  = obj.Score
    @RawScore               = obj.RawScore
    @PopularityIndex        = obj.PopularityIndex

    @SongNameID             = obj.SongNameID

  printName: ->
    console.log @ArtistName + ' - ' + @SongName

  toJSON: ->

    SongID: @SongID
    ArtistID: @ArtistID
    AlbumID: @AlbumID

    SongName: @SongName
    AlbumName: @AlbumName
    ArtistName: @ArtistName

    Year: @Year
    TrackNum: @TrackNum

    CoverArtFilename: @CoverArtFilename
    ArtistCoverArtFilename: @ArtistCoverArtFilename

    TSAdded: @TSAdded
    AvgRating: @AvgRating
    AvgDuration: @AvgDuration
    EstimateDuration: @EstimateDuration

    Flags: @Flags
    IsLowBitrateAvailable: @IsLowBitrateAvailable
    IsVerified: @IsVerified

    Popularity: @Popularity
    Score: @Score
    RawScore: @RawScore
    PopularityIndex: @PopularityIndex

    SongNameID: @SongNameID

module.exports = Song
