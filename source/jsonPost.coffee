
###*
 * @fileoverview Generates the POST headers used for talking to GrooveShark.
###

# Dependencies
Promise = require 'when'

###*
 * Returns the POST data for a http request to GrooveShark
 * - core (core): An instance of the Core class
 * - parameters (object): An object with the parameters you want to send
 * - method (string): The service to use
 * @promises {object} The data to send to GrooveShark's APIs
###
module.exports = (core, parameters, method) ->

  core.getSessionID().then (sessionID) =>
    json =
      parameters:        parameters
      method:            method
      headers:
        privacy:         0
        uuid:            core.uuid
        session:         sessionID
        country:         core.country
        client:          core.token.clientName
        clientRevision:  core.token.clientRevision
        referer:         core.referer
      toString: =>
        JSON.stringify(json)
    return json
