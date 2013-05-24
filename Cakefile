{exec} = require 'child_process'

option '-w', '--watch', 'Watch the folder'

cmd = (name, args, options) ->
  name += ' --watch' if options.watch
  return name + ' ' + args


task 'build', 'Build project to ./bin', (opts) ->
  command = cmd('coffee', '--compile --output ./bin ./src', opts)
  exec command, (err, stdout, stderr) ->
    throw err if err
    console.log stdout + stderr

task 'build_app', 'Build project to ./bin', (opts) ->
  command = cmd('coffee', '--compile --output ./app/js ./app/src', opts)
  console.log command
  exec command, (err, stdout, stderr) ->
    throw err if err
    console.log stdout + stderr

task 'mocha', 'Test project using files in ./test', ->
  exec 'mocha --compilers coffee:coffee-script --timeout 10000 tests', (err, stdout, stderr) ->
    throw err if err
    console.log stdout + stderr

