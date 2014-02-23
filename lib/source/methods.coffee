Promise = require('bluebird')
Core = require('./core')
Song = require('./models/song')


createMethodFactory = (core) ->
  return (options) ->
    return (args...) ->
      if typeof options.parameters is 'function'
        params = options.parameters(args...)
      else
        params = options.parameters
      core.callMethod(options.name, params, options.pattern)


class Methods

  constructor: ->
    @core = new Core()
    @createMethod = createMethodFactory(@core)

    @loadPlugin('download')
    @loadPlugin('broadcast')
    @loadPlugin('search')
    @loadPlugin('playlist')
    @loadPlugin('song')


  ###
   * Load a plugin
   *
   * TODO: use some sort of middleware system like connect/express
   *
   * - plugin (string) : the name of the plugin to load
  ###

  loadPlugin: (plugin) ->

    if typeof plugin is 'string'
      require('./plugins/' + plugin)(this, @createMethod)


module.exports = Methods
