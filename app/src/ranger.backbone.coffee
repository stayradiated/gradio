
global.document = document
$ = require './js/dom'


###*
 * Items
###

class Item extends Backbone.Model

  defaults:
    name: 'Item'


class Items extends Backbone.Collection

  model: Item

  active: false


###*
 * Panes
###

class Pane extends Backbone.Model

  defaults:
    title: 'Pane Title'
    items: new Items()

  up: ->
    @move(-1)

  down: ->
    @move(1)

  # Moves the active selection towards `direction`
  move: (direction) ->
    active = @get('items').active
    length = @get('items').length
    # Don't do anything if we have no items
    if length < 0 then return false
    else if active is false then active = 0
    active += direction
    if active < 0 then active = 0
    else if active > length - 1 then active = length
    @items.set('active', active)


class Panes extends Backbone.Collection

  model: Pane

  active: false


###*
 * VIEWS
###

class ItemView extends Backbone.View

  tagName: 'div'
  className: 'item'
  template: _.template $.id('item-template').innerHTML

  initialize: ->
    _.bindAll(this)
    @model.bind('update', @render)

  render: ->
    @el.innerHTML = @template(this)
    return el


class PaneView extends Backbone.View

  tagName: 'section'
  className: 'pane'

  template: _.template $.id('pane-template').innerHTML

  initialize: ->
    _.bindAll(this)
    @model.get('items').bind('add', @addItem)

  render: ->
    @el.innerHTML = @template(this)
    return @el

  addItem: (item) ->
    itemView = new ItemView(model: item)
    @$el.append itemView.render()


class Ranger extends Backbone.View

  el: $.class('ranger')[0]

  initialize: ->
    _.bindAll(this)
    @panes = new Panes()
    @panes.bind('add', @addPane)

  addPane: (pane) ->
    paneView = new PaneView(model: pane)
    @$el.append paneView.render()

window.ranger = new Ranger()
