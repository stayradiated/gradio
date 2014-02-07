
module.exports = (el) ->

  el.on 'touchstart', (event) ->
    if @scrollTop is 0
      @scrollTop = 1
    else if @offsetHeight + @scrollTop >= @scrollHeight
      @scrollTop -= 1

  el.on 'touchmove', (event) ->
    if @scrollHeight isnt @offsetHeight
      event.stopPropagation()

