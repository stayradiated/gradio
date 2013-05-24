
global.document = document
$ = require './js/dom'


###*
 * @class  Pane
###

class Pane

  constructor: (@el, @items) ->
    @active = 0

  render: ->
    html = ''
    for content, i in @items
      className = if @active is i then 'item active' else 'item'
      html += "<div class=\"#{ className }\">#{ content }</div>"
    @el.innerHTML = html
    return html

  up: =>
    @move(-1)

  down: =>
    @move(1)

  move: (direction) =>
    @active += direction
    if @active < 0 then @active = 0
    else if @active > @items.length - 1 then @active = @items.length - 1
    @render()


###*
 * @class Ranger
###
class Ranger

  constructor: (@el, data) ->
    @active = 0
    @index = 0
    @panes = []
    @addPane(pane) for pane in data

  render: ->
    html = ''
    for pane, i in @panes
      className = if @active is i then 'pane active' else 'pane'
      html += "<section class=\"#{ className }\">" + pane.render() + '</section>'
    @el.innerHTML = html
    return html

  setActive: (id) ->
    @active = id
    active = $.find(@el, '.active.pane')
    $.removeClass(active, 'active') if active?
    active = @panes[id].el
    $.addClass(active, 'active')

  getActive: ->
    return @panes[@active]

  addPane: (pane) ->
    el = $.create('div')
    $.addClass(el, 'pane')
    pane = new Pane(el, pane)
    id = @panes.push(pane)
    id -= 1
    pane.render()
    $.append(el, @el)
    @setActive(id)
    return id

  removePane: (id) ->
    return 0 if id is 0
    @panes.slice(id, 1)
    id--
    @setActive(id)
    return id

  left: ->
    @move(-1)

  right: ->
    @move(1)

  up: =>
    @getActive().up()

  down: =>
    @getActive().down()

  move: (direction) ->
    @active += direction
    if @active < 0 then @active = 0
    else if @active > @panes.length - 1 then @active = @panes.length - 1
    @setActive(@active)


panes = [
  [
    'Item: 1',
    'Item: 2',
    'Item: 3',
    'Item: 4',
    'Item: 5'
  ],
  [
    'Item: 1',
    'Item: 2',
    'Item: 3',
    'Item: 4',
    'Item: 5'
  ],
  [
    'Item: 1',
    'Item: 2',
    'Item: 3',
    'Item: 4',
    'Item: 5'
  ]
]

el = $('.ranger')
window.ranger = new Ranger(el, panes)

document.onkeydown = (e) ->
  switch e.which
    when 37 # left
      ranger.left()
    when 38 # up
      ranger.up()
    when 39 # right
      ranger.right()
    when 40 # down
      ranger.down()
    else
      console.log e.which

# module.exports = Ranger
