
global.document = document
$ = require './js/dom'

App =
  Models: {}
  Collections: {}
  Views: {}

Vent = _.extend(Backbone.Events)

template = (id) ->
  _.template $.id("#{ id }-template").innerHTML

# Make logging nicer
log = -> console.log.apply(console, arguments)

###*
 * Items
###

class App.Models.Item extends Backbone.Model

  defaults:
    name: 'Item'
    pane: false


class App.Collections.Items extends Backbone.Collection

  model: App.Models.Item

  # We should be using some kind of model for this, but I'm not sure
  # how. Maybe this should be part of the Pane? That could work.

  # Stores a reference to the currently active panel
  active: false

  # Stores the position of the currently active panel, useful for moving
  # up and down.
  position: false

  # Sets the active item to `id`
  setActive: (id) ->
    log '> Setting active', id
    @position = id
    # Turn off the previously active item
    @active.trigger('change:active', false) unless @active is false
    @active = @at(id)
    @active.trigger('change:active', true)


###*
 * Panes
###

class App.Models.Pane extends Backbone.Model

  initialize: (data) ->
    log '> Creating a new Pane'
    items = new App.Collections.Items()
    @set('items', items)
    items.add item for item in data.items if data.items?

  # Moves the active selection towards `direction`
  move: (direction) ->
    old = active = @get('items').position
    length = @get('items').length
    if length < 0 then return false
    else if active is false then active = 0
    active += direction
    if active < 0 then active = 0
    else if active > length - 1 then active = length - 1
    @get('items').setActive(active) unless active is old


class App.Collections.Panes extends Backbone.Collection

  model: App.Models.Pane


###*
 * VIEWS
###

# VIEW: Item

class App.Views.Item extends Backbone.View

  tagName: 'div'
  className: 'item'
  template: _.template $.id('item-template').innerHTML

  events:
    'click': 'select'

  initialize: ->
    log '##', @model.get('name')
    log '> Creating new ItemView'
    @model.on('update', @render)
    @model.on('change:active', @setActive)

  render: =>
    log '> Rendering item'
    @el.innerHTML = @template @model.toJSON()
    return this

  select: =>
    pos = @model.collection.indexOf(@model)
    @model.collection.setActive(pos)

  setActive: (state) =>
    $.toggleClass(@el, 'active', state)
    return if state is false
    pane = @model.get('pane')
    Vent.trigger('open:pane', pane)


# VIEW: Pane

class App.Views.Pane extends Backbone.View

  tagName: 'section'
  className: 'pane'
  template: template('pane')

  initialize: ->
    log '#', @model.get('title')
    log '> Creating a new PaneView'
    items = @model.get('items')
    items.on('add', @appendItem)

  render: =>
    log '> Rendering pane view'
    @el.innerHTML = @template @model.toJSON()
    @model.get('items').each(@appendItem)
    return this

  appendItem: (item) =>
    itemView = new App.Views.Item(model: item)
    @$el.append itemView.render().el


# VIEW: Ranger

class App.Views.Ranger extends Backbone.View

  el: $.class('ranger')[0]

  initialize: ->
    @active = false
    @panes = new App.Collections.Panes()
    @panes.on('add', @addPane)
    Vent.on('change:active', @setActive)
    Vent.on('open:pane', @open)

  open: (pane) =>
    @panes.add(pane)

  addPane: (pane) =>
    paneView = new App.Views.Pane( model: pane )
    @$el.append paneView.render().el
    pane.get('items').setActive(0)
    @setActive(pane) if @panes.length is 1

  setActive: (pane) ->
    @active = pane

  up: ->
    @active.move(-1)

  down: ->
    @active.move(1)

  left: ->

  right: ->



# Test everything
window.ranger = new App.Views.Ranger

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

# Sample data
ranger.panes.add
  title: 'Artists'
  items: [
    name: 'Coldplay'
    pane:
      title: 'Albums'
      items: [
        name: 'Mylo Xyloto'
        pane:
          title: 'Songs'
          items: [
            name: 'Hurts Like Heaven'
          ,
            name: 'Paradise'
          ,
            name: 'Charlie Brown'
          ,
            name: 'Us Against The Wind'
          ]
      ,
        name: 'Viva la Vida'
        pane:
          title: 'Songs'
          items: [
            name: 'Life in Technicolor'
          ,
            name: 'Cemeteries of London'
          ,
            name: 'Lost!'
          ,
            name: 'Lovers in Japan'
          ]
      ,
        name: 'A Rush of Blood to the Head'
        pane:
          title: 'Songs'
          items: [
            name: 'Polotik'
          ,
            name: 'In My Place'
          ,
            name: 'God Put a Smile upon Your Face'
          ,
            name: 'Clocks'
          ]
      ,
        name: 'X&Y'
        pane:
          title: 'Songs'
          items: [
            name: 'Square One'
          ,
            name: 'What If'
          ,
            name: 'White Shadows'
          ,
            name: 'Fix You'
          ]
      ]
  ,
    name: 'A2'
    pane:
      title: 'Albums'
      items: [
        name: 'A2 B1'
      ,
        name: 'A2 B2'
      ,
        name: 'A2 B3'
      ,
        name: 'A2 B4'
      ]
  ]
