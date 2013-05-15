###*
 * @fileOverview Scrapes the GrooveShark homepage HTML to get the Country ID.
###

# Dependencies
http = require 'http'
promise = require 'when'

###*
 * @class Country
###

class Country

  constructor: (@core) ->
    @json = null

  # Download raw HTML
  getHtml: =>

    deferred = promise.defer()

    options =
        hostname: @core.domain
        path: '/'
        method: 'GET'
        headers:
          'Accept': 'text/html'
          'Referer': @core.htmlReferer
          'User-Agent': @core.userAgent

      body = ''

      req = http.request options, (res) ->
        res.setEncoding('utf8')
        res.on 'data', (chunk) -> body += chunk
        res.on 'end', -> deferred.resolve(body)

      # Handle errors gracefully
      req.on 'error', (err) -> deferred.reject(err)

      req.end()

    return deferred.promise

  # Parse HTML and return the Country object
  fetch: (force=false) =>

    deferred = promise.defer()

    if @json? and not force
      deferred.resolve(@json)
      return deferred.promise

    # Get raw HTML from grooveshark.com
    @getHtml()

      .then (html) =>
        regex = /"country":(\{[A-Z0-9":,]+\})/
        raw = html.match(regex)[1]
        @json = JSON.parse(raw)

      .otherwise =>
        console.warn 'Warning: Could not get country ID'
        # If it fails, just use some default values
        @json =
          ID: 1
          CC1: 0
          CC2: 0
          CC3: 0
          CC4: 0
          DMA: 0
          IPR: 0

      .always =>
        deferred.resolve(@json)

    return deferred.promise

module.exports = Country
