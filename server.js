var mongoose = require('mongoose')
var express = require('express')

mongoose.Promise = global.Promise
mongoose.connect("mongodb://localhost:27017/BrowserDrawPix")

var app = express()
var port = process.argv[2] ? process.argv[2] : 8080
var server = app.listen(port, function() {})

var exportJobsRouter = express.Router()
require('./router.exportJobs')(exportJobsRouter)
app.use(exportJobsRouter)
