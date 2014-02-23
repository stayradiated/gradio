.PHONY: test

MOCHA=./node_modules/.bin/mocha --compilers coffee:coffee-script/register

TESTS=test/*

test:
		@BLUEBIRD_DEBUG=1 \
	  $(MOCHA) -R spec $(TESTS) --bail

watch:
	  $(MOCHA) -R spec $(TESTS) --bail --watch
