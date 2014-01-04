
Base = require 'base'

class Search extends Base.View

  ui:
    input: '.search input'
    dropdown: '.dropdown'
    type: '.dropdown button'

  events:
    'keydown .search': 'open'
    'click .dropdown button': 'openMenu'
    'click .dropdown ul li': 'chooseItem'

  constructor: ->
    super
    @type = 'Songs'

  open: (e) =>
    return true unless e.which is 13
    @play()

  play: =>
    query = @ui.input.val()
    if @type is 'Songs' and not isNaN parseInt(query)
      @trigger 'playlist', query
    else
      @trigger 'search', query, @type

  openMenu: =>
    @ui.dropdown.addClass 'show'

  hideMenu: =>
    @ui.dropdown.removeClass 'show'

  chooseItem: (event) =>
    element = $(event.target)
    name = element.text()
    @type = switch element.data('id')
      when 0 then 'Songs'
      when 1 then 'Playlists'
      when 2 then 'Artists'
      when 3 then 'Albums'
      when 4 then 'User'
      when 5 then 'Broadcast'
      when 6 then 'Best Of'
    @ui.type.text(name)
    @ui.dropdown.find('.active').removeClass('active')
    element.toggleClass('active')
    @hideMenu()

module.exports = Search
