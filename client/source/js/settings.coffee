
Base = require 'base'

class Settings extends Base.Model

  defaults:
    'port': 7070
    'host': 'localhost'

module.exports = new Settings()

