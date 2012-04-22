var logging = require('logref')
var stoopid = require('stoopid')
var path = require('path')
var tako = require('tako')
var filed = require('filed')
var fs = require('fs')
var _ = require('underscore')
var deepExtend = require('deep-extend')
var timeago = require('timeago')
var request = require('request').defaults({json: true})
var couch = "http://max.iriscouch.com/portlandsmells"

logging.stdout()
process.logging = logging

var app = tako({logger: stoopid.logger('tako'), socketio: {logger: stoopid.logger('socketio')}})

app.route('/', function (req, resp) {
  filed(path.resolve(__dirname, 'attachments', 'index.html')).pipe(resp)
}).methods('GET')

app.route('/api/v1/update', function (req, resp) {
  var save = request({method: "POST", url: couch})
  req.pipe(save)
  save.pipe(resp)
}).methods('POST')

app.route('/api/v1/nearby', function (req, resp) {
  var lat = req.qs.lat
  var lon = req.qs.lon
  if (!lat || !lon) return resp.end('must include lat and lon parameters')
  
  var lat = +lat
  var lon = +lon
  var ten_miles = 0.24; // in degrees -- rough estimate
  var nearby = couch + "/_design/gc-utils/_spatial/geomsFull?bbox="+ (lon - ten_miles) + "," + (lat - ten_miles) + "," + (lon + ten_miles) + "," + (lat + ten_miles)
  request(nearby).pipe(resp)
}).methods('GET')

app.route('/*').files(path.resolve(__dirname, 'attachments'))

app.httpServer.listen(8000, function () { console.log("running on " + "8000") })