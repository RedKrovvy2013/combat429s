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

// -------------------------------------
var axios = require('axios')

var ExportJob = require('./model.ExportJob')
var AuthoringFile = require('./model.AuthoringFile')
var exportJobsQueue = require('./exportJobsQueue')

for(var i=0; i < 7; ++i) {
    var exportJob = function(done) {
        axios.post("http://localhost:8081/convertToPDF", {
            authoringData: "xyz123"
        })
        .then(function(res) {
            done("success")
        })
        .catch(function(e) {
            if(e.response.status === 429) {
                done("error-429")
            }
        })
    }
    exportJob.no = i + 1
    exportJobsQueue.push(exportJob)
}

// -------------------------------------

module.exports = app
