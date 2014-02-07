Base = require 'base'

isMobile = !!('ontouchstart' of window) or !!('onmsgesturechange' of window)

# Replace click events with touchend events
Base.touchify = (events={}) ->
  return events unless isMobile
  for event, action of events
    touchEvent = event.replace /^(click|mousedown)/, 'touchstart'
    if touchEvent[0...8] is 'touchstart'
      delete events[event]
      events[touchEvent] = action
  return events

Base.touchify.event = if isMobile then 'touchend' else 'click'

module.exports = Base.touchify