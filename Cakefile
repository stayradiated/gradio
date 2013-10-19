{exec, spawn} = require 'child_process'

option '-w', '--watch', 'Watch the folder'

cmd = (name, args, options) ->
  name += ' --watch' if options.watch
  return name + ' ' + args

task 'compile', 'Compile coffeescript to javascript', (opts) ->
  command = cmd('coffee', '--compile --output ./bin ./source', opts)
  console.log command
  exec command, (err, stdout, stderr) ->
    throw err if err
    console.log stdout + stderr

task 'test', 'Test project using files in ./test', ->

  args = ['--compilers', 'coffee:coffee-script', '--timeout', '10000', 'tests']
  terminal = spawn('mocha', args)
  terminal.stdout.on 'data', (data) -> console.log(data.toString())
  terminal.stderr.on 'data', (data) -> console.log(data.toString())

task 'server', 'Start server', ->

  Core = require './source/core'
  Server = require './source/server'

  core = new Core()
  server = new Server(core)

  core.init()

  server.listen(8080)
