Core = require '../src/core'

core = new Core()

# Only the first fetch() should query GrooveShark
# The rest should load directly from memory and be nearly instanteousn

core.country.fetch()
  .then (json) ->
    console.log json
    core.country.fetch()
  .then (json) ->
    console.log json
    core.country.fetch()
  .then (json) ->
    console.log json

