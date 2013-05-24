
$ = require './dom'

class Playlist

  elements:
    'input': '.search'
    'table': 'table tbody'

  events:
    'keydown .search': 'search'
    'click table': 'play'

  constructor: (@el) ->

    for name, query of @elements
      @[name] = $.find(@el, query)

    for str, method of @events
      [str, ev, el] = str.match(/^(\w+) (.+)$/)
      $.find(@el, el).addEventListener(ev, @[method])

  search: (e) =>
    return true unless e.which is 13
    query = @input.value
    App.getSearchResults(query, 'Songs').then (response) =>
      @display(response.result)

    App.getSearchResults(query, ['Songs', 'Artists', 'Albums']).then (response) =>
      console.log response

    return true

  display: (songs) =>
    html = ''
    for song, i in songs
      break if i > 10
      html += """
        <tr data-id="#{ song.SongID }">
          <td>#{ song.SongName }</td>
          <td>#{ song.ArtistName }</td>
          <td>#{ song.AlbumName }</td>
        </tr>
      """
    @table.innerHTML = html

  play: (e) ->
    tr = e.srcElement.parentNode
    Player.setSource("http://localhost:8080/song/#{ tr.dataset.id }.mp3")


module.exports = Playlist
