
Base = require 'base'

class Search extends Base.Controller

  elements:
    '.search': 'input'

  events:
    'keydown .search': 'open'

  constructor: ->
    super

  open: (e) =>
    
    return true unless e.which is 13
    query = @input.val()
    if not isNaN parseInt(query)
      @trigger 'playlist', query
    else
      @trigger 'search', query

    return true

module.exports = Search
