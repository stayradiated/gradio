{exec, spawn} = require 'child_process'

option '-w', '--watch', 'Watch the folder'

cmd = (name, args, options) ->
  name += ' --watch' if options.watch
  return name + ' ' + args

task 'compile', 'Compile coffeescript to javascript', (opts) ->
  command = cmd('coffee', '--compile --output ./bin ./src', opts)
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

  args = [__dirname + '/tests/server.coffee']
  terminal = spawn('coffee', args)
  terminal.stdout.on 'data', (data) -> console.log(data.toString()[0...-1])
  terminal.stderr.on 'data', (data) -> console.log(data.toString()[0...-1])

