
Base = require 'base'

class Settings extends Base.Model

  defaults:
    'port': 7070
    'host': '192.168.1.25'

module.exports = new Settings()

