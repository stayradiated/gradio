
###*
 * @fileOverview Loads and parses token.properties
###

fs = require 'fs'

tokenFile = '../token.json'
data = fs.readFileSync(tokenFile).toString()
prop = JSON.parse(data)

module.exports = prop
