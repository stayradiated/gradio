{exec} = require 'child_process'

task 'build', 'Build project to ./bin', ->
  exec 'coffee --compile --output ./bin ./src', (err, stdout, stderr) ->
    throw err if err
    console.log stdout + stderr

task 'test', 'Test project using files in ./test', ->
  exec 'mocha --compilers coffee:coffee-script --timeout 10000 tests', (err, stdout, stderr) ->
    throw err if err
    console.log stdout + stderr
