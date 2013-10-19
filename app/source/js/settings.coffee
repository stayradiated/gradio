
Base = require 'base'

class Settings extends Base.Model

  defaults:
    'port': 8080
    'host': '192.168.0.100'

module.exports = new Settings()

