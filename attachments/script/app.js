var app = {cache:{}, profile: {}, baseURL: 'http://portlandsmells.com', eventCache: couchie('events')}
app.retina = window.devicePixelRatio > 1 ? true : false
var events = require('events')
app.emitter = new events.EventEmitter

/*
  app.routes
    - pages (URL routed with nodejitsu's director.js, hrefs like "#/" or "#/bob")
    - modals (no URL change triggered, hrefs like "#/cancel!" or "#/logout!")
*/

app.routes = {
  pages: {
    welcome: function() {
      util.render('welcome', '.container')
      showMap()
      var portlandCenter = new L.LatLng(45.526674856483375, -122.67127990722656)
      app.map.setView(portlandCenter, 12)
      locateAndSetMap()
      
      // $('.crosshair').css('left', (document.body.clientWidth - 320) / 2);
      
      // showEventOnMap(ev)
    }
  },
  modals: {
    back: function() {
      window.history.back()
    },
    submit: function() {
      $('form').first().submit()
    }
  }
}

app.after = {
  welcome: function() {
    util.getPosition(function(err, position) {
      if (err) console.log('gps error: '+ err)
    })
  }
}

function locateAndSetMap() {
  app.map.locate()
  app.map.on('locationfound', function(data) {
    app.map.setView(data.latlng, 12)
  })
}

function showMap(container) {
  app.map = new L.Map(container || 'mapbox', {zoom: 12, attributionControl: false, zoomControl: false})
  var tiles ="http://tile.stamen.com/toner/{z}/{x}/{y}.jpg"
  var layer = new L.TileLayer(tiles, {maxZoom: 16, minZoom: 3, detectRetina: true})
  app.map.addLayer(layer)
}

function showEventOnMap(ev) {
  var markerLocation = new L.LatLng(ev.location.location.lat, ev.location.location.lng)
  
  var marker = new L.Marker(markerLocation)
  
  ev = formatEvents([ev])[0]
  marker.bindPopup(util.buildTemplate('mapMarker', ev), {closeButton: false})
  app.map.addLayer(marker)
}

function showEventsOnMap(map) {
  app.eventCache.all(function(err, cachedEvents) {
    _.each(cachedEvents, function(ev) {
      if (!ev.location) return
      showEventOnMap(ev)
    })
  })
}

function serializeEventForm(form) {
  var doc = $(form).serializeObject()
  _.extend(doc, {
    // form
  })

  return doc
}

function redirect(uri) {
  window.location.href = uri
}

function loadDefaultUI() {
  util.render('main', '.container')
}

$(document).ready(function() {
  
  app.router = Router({
    '/': { on: function() {
      redirect("#/welcome")
    } },
    '/:page': { on: function(page) {
      loadDefaultUI()
      util.switchNav(page);
      app.routes.pages[page]()
    } }
  }).configure({ notfound: function() { redirect("#/") } }).init('/')

});