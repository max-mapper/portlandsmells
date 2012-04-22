var logging = require('logref')
var stoopid = require('stoopid')
var path = require('path')
var tako = require('tako')
var filed = require('filed')
var fs = require('fs')
var _ = require('underscore')
var deepExtend = require('deep-extend')
var timeago = require('timeago')

logging.stdout()
process.logging = logging

var app = tako({logger: stoopid.logger('tako'), socketio: {logger: stoopid.logger('socketio')}})

app.route('/', function (req, resp) {
  filed(path.resolve(__dirname, 'attachments', 'index.html')).pipe(resp)
}).methods('GET')

app.route('/api/v1/update', function (req, resp) {
  req.pipe(process.stdout)
}).methods('POST')

app.route('/*').files(path.resolve(__dirname, 'attachments'))

app.httpServer.listen(8000, function () { console.log("running on " + "8000") })