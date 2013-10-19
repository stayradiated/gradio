
Base = require 'base'

class Search extends Base.Controller

  elements:
    '.search input': 'input'
    '.dropdown': 'dropdown'
    '.dropdown button': 'chosenType'

  events:
    'keydown .search': 'open'
    'click .dropdown ul li': 'chooseItem'

  constructor: ->
    super
    @type = 'Songs'

  open: (e) =>

    return true unless e.which is 13
    query = @input.val()
    if not isNaN parseInt(query)
      @trigger 'playlist', query
    else
      @trigger 'search', query, @type

    return true

  chooseItem: (event) =>
    element = $(event.target)
    name = element.text()
    @type = switch element.data('id')
      when 0 then 'Songs'
      when 1 then 'Playlists'
      when 2 then 'Artists'
      when 3 then 'Albums'
    @chosenType.text(name)
    @dropdown.find('.active').removeClass('active')
    element.toggleClass('active')
    console.log 'chosing type', @type


module.exports = Search
