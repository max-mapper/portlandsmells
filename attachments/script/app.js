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
      util.render('map', '#content')
      util.render('mapButtons', '.buttons')
      showMap()
      var portlandCenter = new L.LatLng(45.526674856483375, -122.67127990722656)
      app.map.setView(portlandCenter, 12)
      locateAndSetMap()
      util.render('crosshair', '#crosshair')
      
      $('.crosshair').css('left', (document.body.clientWidth - 320) / 2);
      $('.crosshair').css('top', ($('#mapbox').height() / 2) - 90)
      
    },
    details: function() {
      util.render('details', '#content')
      util.render('detailButtons', '.buttons')
    }
  },
  modals: {
    back: function() {
      window.history.back()
    },
    map: function() {
      app.selectedPoint = app.map.getCenter()
      redirect('#/details')
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
      loadSmells(position.coords.latitude, position.coords.longitude, function(err, smells) {
        showEventsOnMap(smells.rows)
      })
    })
  },
  details: function() {
    var form = $('form').first()
    form.submit(function(e) {
      $('.buttons a').hide()
      e.preventDefault()
      var data = _.extend({}, form.serializeObject(), app.selectedPoint || {})
      data.geometry = {type: "Point", coordinates: [data.lng, data.lat]}
      request({url: app.baseURL + '/api/v1/update', json: data, method: "POST"}, function(err, resp, json) {
        redirect('#/')
      })
      return false
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

function loadSmells(lat, lon, callback) {
   request({url: app.baseURL + '/api/v1/nearby?lat=' + lat + '&lon=' + lon, json: true}, function(err, resp, json) {
     callback(err, json)
   })
}

function showEventOnMap(ev) {
  var markerLocation = new L.LatLng(ev.geometry.coordinates[1], ev.geometry.coordinates[0])
  
  var marker = new L.Marker(markerLocation)
  marker.bindPopup(ev.value.title + '<br/>' + ev.value.description, {closeButton: false})
  app.map.addLayer(marker)
}

function showEventsOnMap(events, map) {
  _.each(events, function(ev) {
    if (!ev.geometry) return
    showEventOnMap(ev)
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

$(document).ready(function() {
  util.listenForTouches()
  
  app.router = Router({
    '/': { on: function() {
      util.render('welcome', '.container')
      
      redirect("#/welcome")
    } },
    '/:page': { on: function(page) {
      util.render('welcome', '.container')
      
      util.switchNav(page);
      app.routes.pages[page]()
    } }
  }).configure({ notfound: function() { redirect("#/") } }).init('/')

});