// A very special file
// It will detect if we are running in NodeJS or the Browser
// And then load the appropriate files

(function() {

  var loadScript = function(path) {
    var el = document.createElement('script');
    el.setAttribute('type', 'text/javascript');
    el.setAttribute('src', path); 
    document.getElementsByTagName('Head')[0].appendChild(el);
  };

  if (typeof process !== 'undefined') {
    // Running in NodeJS
   loadScript('./js/bin/init.js'); 
  } else {
    // Running in the browser
    loadScript('./js/lib/swig.js'); 
    loadScript('./js/packaged.js');
  }

}());
