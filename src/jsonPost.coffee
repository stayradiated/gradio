
###*
 * @fileoverview Generates the POST headers used for talking to GrooveShark.
###

# Dependencies
Token = require './token'
promise = require 'when'

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

    deferred = promise.defer()

    sessionID = null

    # Get the session ID
    core.getSessionID()

      .then (id) ->

        sessionID = id
        core.country.fetch()

      .then (country) =>

        @header = {
          uuid: core.uuid
          privacy: 0
          session: sessionID
          country: country
        }

        # Setting client details

        if @method in core.jsMethod
          @header.client = core.jsName
          @header.clientRevision = Token.jsVersion
          @referer = core.jsReferer

        else if @method in core.htmlMethod
          @header.client = core.htmlName
          @header.clientRevision = Token.htmlVersion
          @referer = core.htmlReferer

        else
          console.log '> ERROR: Could not find method for', @method

        deferred.resolve(this)

    return deferred.promise

  toString: =>
    json =
      header: @header
      parameters: @parameters
      method: @method
    return JSON.stringify(json)

module.exports = JsonPost
