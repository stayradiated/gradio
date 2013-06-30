{exec, spawn} = require 'child_process'

option '-w', '--watch', 'Watch the folder'

cmd = (name, args, options) ->
  name += ' --watch' if options.watch
  return name + ' ' + args

task 'build', 'Build project to ./bin', (opts) ->
  command = cmd('coffee', '--compile --output ./bin ./src', opts)
  console.log command
  exec command, (err, stdout, stderr) ->
    throw err if err
    console.log stdout + stderr

task 'build_app', 'Build project to ./bin', (opts) ->
  command = cmd('coffee', '--compile --output ./app/js ./app/src', opts)
  console.log command
  exec command, (err, stdout, stderr) ->
    throw err if err
    console.log stdout + stderr

task 'test', 'Test project using files in ./test', ->

  args = ['--compilers', 'coffee:coffee-script', '--timeout', '10000', 'tests']
  terminal = spawn('mocha', args)

  terminal.stdout.on 'data', (data) -> console.log(data.toString())
  terminal.stderr.on 'data', (data) -> console.log(data.toString())
  terminal.on 'error', (data) -> console.log(data.toString())
  terminal.on 'close', (data) -> console.log(data.toString())
