Search = (core, createMethod) ->


  ###
   * Search
   *
   * Perform a search.
   *
   * - query (string) : what to search with
   * - type (string) : what to search through
   *   [Songs, Artists, Albums, Playlists, Users, Events]
  ###

  core.search = createMethod
    name: 'getResultsFromSearch'
    pattern: '!.result.result.*'
    parameters: (query, type) ->
      guts: 0
      ppOverride: false
      query: query
      type: type

module.exports = Search
