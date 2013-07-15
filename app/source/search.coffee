
Base = require 'base'

class Search extends Base.Controller

  elements:
    '.search': 'input'

  events:
    'keydown .search': 'search'

  constructor: ->
    super

  search: (e) =>
    
    return true unless e.which is 13
    query = @input.val()
    @input.blur()
    @trigger 'search', query

    return true

module.exports = Search
