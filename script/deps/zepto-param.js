//     Zepto.js
//     (c) 2010-2012 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

(function ($) {
  
  var escape = encodeURIComponent;

  function serialize(params, obj, traditional, scope){
    var array = $.isArray(obj);
    $.each(obj, function(key, value) {
      if (scope) key = traditional ? scope : scope + '[' + (array ? '' : key) + ']';
      // handle data in serializeArray() format
      if (!scope && array) params.add(value.name, value.value);
      // recurse into nested objects
      else if (traditional ? $.isArray(value) : $.isObject(value))
        serialize(params, value, traditional, key);
      else params.add(key, value);
    });
  }
  
  // ### $.param
  //
  // Encode object as a string of URL-encoded key-value pairs
  //
  // *Arguments:*
  //
  //     obj — object to serialize
  //     [traditional] — perform shallow serialization
  //
  // *Example:*
  //
  //     $.param( { name: 'Zepto.js', version: '0.6' } );
  //
  $.param = function(obj, traditional){
    var params = [];
    params.add = function(k, v){ this.push(escape(k) + '=' + escape(v)) };
    serialize(params, obj, traditional);
    return params.join('&').replace('%20', '+');
  };

})(Zepto);
