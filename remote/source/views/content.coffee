Base = require 'base'
debounce = require '../utils/debounce'

class Content extends Base.View

  el: '.app .content'

  events:
    'click li': 'select'

  ui:
    list: 'ul'

  constructor: ->
    super

    # Disable bouncing
    debounce @el

    @render [
      { name: 'Acker Bilk', time: '3.50' },
      { name: 'Richard Clayderman', time: '4.20' },
    ]


  template: (obj) ->

    text = '<li>'

    for key, value of obj
      text += "<span class=\"#{ key }\">#{ value }</span>"

    text += '</li>'

    return text

  render: (items) ->

    text = ''
    text += @template(item) for item in items
    @ui.list.html text

  select: (e) =>
    @active?.removeClass('active')
    @active = $(e.currentTarget)
    @active.addClass('active')

module.exports = Content

