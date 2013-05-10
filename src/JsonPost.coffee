
App = require './app'
TokenKey = require './TokenKey'

module.exports = (parameters, method) ->

  header =
    'uuid': App.uuid
    'privacy': 0
    'session': App.sessionid
    'country':
      CC1: 0
      CC2: 0
      CC3: 137438953472
      CC4: 0
      DMA: 0
      ID: 166
      IPR: 0

  if method in App.jsMethod
    header.client = App.nameJS
    header.clientRevision = TokenKey.jsVersion

  else if method in App.htmlMethod
    header.client = App.nameHTML
    header.clientRevision = TokenKey.htmlVersion

  header.session = App.sessionid

  if header.session is ''
    console.error 'Error: Session ID is not set!'

  header: header
  parameters: parameters
  method: method
