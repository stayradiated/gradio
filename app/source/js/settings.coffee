
Base = require 'base'

class Settings extends Base.Model

  defaults:
    'port': 8080
    'host': 'localhost'

module.exports = new Settings()

