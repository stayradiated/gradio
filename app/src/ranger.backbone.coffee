
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

  initialize: (data, options) ->
    @items = new Items()
    if data.contents?
      for name in data.contents
        @items.add( name: name )

  up: ->
    @move(-1)

  down: ->
    @move(1)

  # Moves the active selection towards `direction`
  move: (direction) ->
    active = @items.active
    length = @items.length
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
    console.log '> Creating new ItemView'
    _.bindAll(this)
    @model.bind('update', @render)
    @render()

  render: ->
    console.log '> Rending item'
    @el.innerHTML = @template @model.toJSON()
    return @el


class PaneView extends Backbone.View

  tagName: 'section'
  className: 'pane'
  template: _.template $.id('pane-template').innerHTML

  initialize: ->
    console.log '> Creating a new PaneView'
    _.bindAll(this)
    @model.items.bind('add', @addItem)

  render: ->
    console.log '> Rendering pane view'
    @el.innerHTML = @template @model.toJSON()
    return @el

  addItem: (item) ->
    console.log '> Adding item to Panes collection', item.get('name')
    itemView = new ItemView(model: item)
    @$el.append itemView.render()


class Ranger extends Backbone.View

  el: $.class('ranger')[0]

  initialize: ->
    _.bindAll(this)
    @panes = new Panes()
    @panes.bind('add', @addPane)

  addPane: (pane) ->
    console.log '> A pane has been added'
    paneView = new PaneView(model: pane)
    @$el.append paneView.render()


window.ranger = new Ranger()
ranger.panes.add
  title: 'First pane'
  contents: [
    '1.1 item'
    '1.2 item'
    '1.3 item'
    '1.4 item'
  ]
