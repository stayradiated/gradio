// Generated by CoffeeScript 1.6.2
(function() {
  var Core, TokenKey, UUID, app, crypto, promise, request, uuid,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  request = require('request');

  promise = require('when');

  crypto = require('crypto');

  uuid = require('uuid');

  TokenKey = require('./TokenKey');

  UUID = {
    randomUUID: function() {
      return '1FB2F3AC-6817-4CEE-8819-B4183B1951AF';
    }
  };

  Core = (function() {
    function Core() {
      this.callMethod = __bind(this.callMethod, this);
      this.getTokenKey = __bind(this.getTokenKey, this);
      this.getToken = __bind(this.getToken, this);
      this.getSecretKey = __bind(this.getSecretKey, this);
      this.getSessionID = __bind(this.getSessionID, this);      this.domain = 'grooveshark.com';
      this.methodphp = 'more.php';
      this.streamphp = 'stream.php';
      this.protocol = 'http';
      this.homeurl = this.protocol + '://' + this.domain;
      this.methodurl = this.homeurl + '/' + this.methodphp;
      this.jsMethod = ['getStreamKeyFromSongIDEx', 'markSongComplete', 'markSongDownloadedEx', 'markStreamKeyOver30Seconds'];
      this.htmlMethod = ['getCommunicationToken', 'getResultsFromSearch', 'authenticateUser', 'playlistAddSongToExisting', 'playlistAddSongToExisting', 'popularGetSongs', 'playlistGetSongs', 'initiateQueue', 'userAddSongsToLibrary', 'userGetPlaylists', 'userGetSongsInLibrary', 'getFavorites', 'favorite', 'getCountry', 'albumGetSongs'];
      this.nameHTML = 'htmlshark';
      this.nameJS = 'jsqueue';
      this.versionHTML = '';
      this.versionJS = '';
      this.versionSwf = '20121003.33';
      this.password = '';
      this.newTokenTime = 960;
      this.uuid = uuid.v1();
      this.sessionid = '';
      this.token = '';
    }

    /**
     * Returns the needed Grooveshark's SessionID to communicate with the
     * services and generate the secret key, it is also stored as an attribute
     * to be used by the other methods.
     * @promises {string} Grooveshark's SessionID
    */


    Core.prototype.getSessionID = function() {
      var deferred,
        _this = this;

      deferred = promise.defer();
      if (this.sessionid !== '') {
        deferred.resolve(this.sessionid);
      } else {
        request(this.homeurl, function(err, res, body) {
          var cookies;

          cookies = res.headers['set-cookie'];
          _this.sessionid = cookies[0].split('=')[1].split(';')[0];
          return deferred.resolve(_this.sessionid);
        });
      }
      return deferred.promise;
    };

    /**
     * Generates the SecretKey from the SessionID needed to get the communication
     * Token and return s it. If getSessionID() hasn't already been called, it
     * will do it automagically
     * @return SessionID's SecretKey
    */


    Core.prototype.getSecretKey = function() {
      var md5, secretKey;

      md5 = crypto.createHash('md5');
      md5.update(this.sessionid, 'utf-8');
      secretKey = md5.digest('hex');
      return secretKey;
    };

    /**
     * Returns the needed Grooveshark's communication Token value to communicate
     * with the services, it is also stored as an attribute to be used by the
     * other methods.
     * @return {string} Token's value
    */


    Core.prototype.getToken = function() {
      var deferred, parameters,
        _this = this;

      deferred = promise.defer();
      parameters = {
        secretKey: this.getSecretKey()
      };
      this.methodurl = 'https' + '://' + this.domain + '/' + this.methodphp;
      this.callMethod(parameters, 'getCommunicationToken').then(function(response) {
        _this.methodurl = 'http' + '://' + _this.domain + '/' + _this.methodphp;
        _this.token = response.result;
        return deferred.resolve(_this.token);
      });
      return deferred.promise;
    };

    /**
     * Generate the TokenKey using Grooveshark's hacked password and the method
     * to call a service correctly.
     * @param  {string} method The service to call
     * @return {string} The token key
    */


    Core.prototype.getTokenKey = function(method) {
      var hashhex, pass, pos, randomhex, sha1;

      if (this.token === '') {
        return console.error('Error: no token!');
      }
      randomhex = '';
      while (6 > randomhex.length) {
        pos = Math.floor(Math.random() * 16);
        randomhex += "0123456789abcdef".charAt(pos);
      }
      if (__indexOf.call(this.jsMethod, method) >= 0) {
        this.password = TokenKey.jsToken;
        this.versionJS = TokenKey.jsVersion;
      } else if (__indexOf.call(this.htmlMethod, method) >= 0) {
        this.password = TokenKey.htmlToken;
        this.versionHTML = TokenKey.htmlVersion;
      }
      pass = method + ':' + this.token + ':' + this.password + ':' + randomhex;
      sha1 = crypto.createHash('sha1');
      hashhex = sha1.update(pass).digest('hex');
      return randomhex + hashhex;
    };

    Core.prototype.callMethod = function(parameters, method) {
      var deferred, json, options;

      deferred = promise.defer();
      json = require('./JsonPost')(parameters, method);
      if (method !== 'getCommunicationToken') {
        json.header.token = this.getTokenKey(method);
      }
      options = {
        url: this.methodurl + '?' + method,
        method: 'POST',
        body: JSON.stringify(json),
        headers: {
          'Referer': 'http://grooveshark.com/'
        }
      };
      request(options, function(err, res, body) {
        if (err) {
          return console.error('err', err);
        }
        return deferred.resolve(JSON.parse(body));
      });
      return deferred.promise;
    };

    return Core;

  })();

  app = new Core();

  module.exports = app;

}).call(this);
