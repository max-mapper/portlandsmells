var util = function() {

  $.fn.serializeObject = function() {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
      if (o[this.name]) {
        if (!o[this.name].push) {
          o[this.name] = [o[this.name]];
        }
        o[this.name].push(this.value || '');
      } else {
        o[this.name] = this.value || '';
      }
    });
    return o;
  };
  
  // from stackoverflow
  function getParameterByName(url, name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(url);
    if (results == null) return "";
    else return decodeURIComponent(results[1].replace(/\+/g, " "));
  }
  
  function render( template, target, data ) {
    target = $( target ).first()
    target.html( buildTemplate(template, data) )
    if (template in app.after) app.after[template]()
  }
  
  function buildTemplate(template, data) {
    return $.mustache( $( "." + template + "Template" ).first().html(), data || {} )
  }

  function switchNav(page) {
    if (page.length === 0 || $('.topNav #' + page + '-icon').length === 0) return
    $('.topNav .list-on').removeClass('list-on').addClass('list-off')
    $('.topNav .map-on').removeClass('map-on').addClass('map-off')
    $('.topNav #' + page + '-icon div').addClass(page + '-on').removeClass(page + '-off')
    $('.ui-content').attr('id', page)
  }
  
  function catchModals( event ) {
    var route = $(event.currentTarget).attr('href')
    if (!route) return false
    // Basic rules:
    // * If the href ends with a bang (!) we're going to launch a modal
    // * Otherwise, we're going to pass it through to Director
    if ( route && route.indexOf( '!' ) === ( route.length - 1 ) ) {
      route = route.replace('#/', '') // Trim off the #/ from the beginning of the route if it exists
      route = route.substr(0, route.lastIndexOf('!'))
      var id = route.split('/')[1] // The ID (if one exists) will be what comes after the slash
      if (id) route = route.split('/')[0] // If there is an ID, then we have to trim it off the route
      if (route in app.routes.modals) app.routes.modals[ route ](id)
      if (_.isObject(event)) event.preventDefault()
    } else {
      redirect(route)
    }
  }
  
  function pointDistance(pt1, pt2) {
    var lon1 = pt1.coordinates[0],
      lat1 = pt1.coordinates[1],
      lon2 = pt2.coordinates[0],
      lat2 = pt2.coordinates[1],
      dLat = gju.numberToRadius(lat2 - lat1),
      dLon = gju.numberToRadius(lon2 - lon1),
      a = Math.pow(Math.sin(dLat / 2), 2) + Math.cos(gju.numberToRadius(lat1))
        * Math.cos(gju.numberToRadius(lat2)) * Math.pow(Math.sin(dLon / 2), 2),
      c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return ((6371 * c) * 1000) * 3.2808399; // returns feet
  }
  
  function getLocationContext(loc) {
    var context = "", distance = false
    if (loc.address) context += loc.address + ' '
    if (loc.crossStreet) context += loc.crossStreet + ' '
    if (loc.city) context += "in " + loc.city
    if (!loc.address) {
      if (loc.distance) {
        distance = loc.distance
      } else if (app.lastPosition) {
        var pt1 = {type: "Point", coordinates: [app.lastPosition.coords.longitude, app.lastPosition.coords.latitude]}
        var pt2 = {type: "Point", coordinates: [loc.lng, loc.lat]}
        distance = pointDistance(pt1, pt2)
      }
      if (distance) context = (distance/5280).toString().slice(0,3) + ' mi away'
    }
    return context
  }
  
  function getPosition(callback) {
    if (!callback) var callback = function() {}
    navigator.geolocation.getCurrentPosition(
      function(position) {
        app.lastPosition = position;
        if (callback) callback(false, position)
      },
      function(error) {
        if (callback) callback(error)
      },
      { maximumAge: 3000, timeout: 5000, enableHighAccuracy: true }
    );
  }
  
  function toRad(n) {  // convert degrees to radians
    return n * Math.PI / 180;
  }

  function toDeg(n) {  // convert radians to degrees (signed)
    return n * 180 / Math.PI;
  }

  function toBrng(n) {  // convert radians to degrees (as bearing: 0...360)
    return (toDeg(n)+360) % 360;
  }
  
  function getBearing(lat1, lon1, lat2, lon2) {
    lat1 = toRad(lat1); lat2 = toRad(lat2);
    var dLon = toRad((lon2-lon1));

    var y = Math.sin(dLon) * Math.cos(lat2);
    var x = Math.cos(lat1)*Math.sin(lat2) -
            Math.sin(lat1)*Math.cos(lat2)*Math.cos(dLon);
    return toBrng(Math.atan2(y, x));
  }
  
  function turnOffClick(elems) {
    _.each(elems, function(el) {
      $(el).live('click', function(e) {
        e.preventDefault()
        return false
      })
    })
  }
  
  function listenForTouches() {
    if (Modernizr.touch) {
      turnOffClick(['a', 'input'])
      
      $('a').live('tap', function(e) {
        util.catchModals(e)
      })
      
    } else {
      $('a').live('click', function(e) {
        util.catchModals(e)
      })
    }
  }
  
  return {
    getParameterByName: getParameterByName,
    render: render,
    buildTemplate: buildTemplate,
    catchModals: catchModals,
    pointDistance: pointDistance,
    getLocationContext: getLocationContext,
    getPosition: getPosition,
    getBearing: getBearing,
    switchNav: switchNav,
    turnOffClick: turnOffClick,
    listenForTouches: listenForTouches
  };
}();