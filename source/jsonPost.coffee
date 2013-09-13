
###*
 * @fileoverview Generates the POST headers used for talking to GrooveShark.
###

# Dependencies
Token = require '../token.json'
Promise = require 'when'

###*
 * @class JsonPost
###
class JsonPost

  ###*
   * Returns the POST data for a http request to GrooveShark
   * @params {Core} core - An instance of the Core class
   * @params {object} parameters - An object with the parameters you want to send
   * @params {string} method - The service to use
   * @promises {object} The data to send to GrooveShark's APIs
  ###
  constructor: (core, @parameters, @method) ->

    deferred = Promise.defer()

    sessionData = Promise.all [
      core.getSessionID(),
      core.country.fetch()
    ]
    
    sessionData.then ([sessionID, country]) =>

      @header =
        uuid: core.uuid
        privacy: 0
        session: sessionID
        country: country

      # Setting client details

      if @method in core.methods.js
        @header.client         = Token.jsName
        @header.clientRevision = Token.jsVersion
        @referer               = core.referer.js

      else if @method in core.methods.html
        @header.client         = Token.htmlName
        @header.clientRevision = Token.htmlVersion
        @referer               = core.referer.html

      else
        console.log '> ERROR: Could not find method for', @method

      deferred.resolve this

    return deferred.promise

  toString: =>
    json =
      header: @header
      parameters: @parameters
      method: @method
    return JSON.stringify(json)

module.exports = JsonPost
