var axios = require('axios')

var ExportJob = require('./model.ExportJob')
var AuthoringFile = require('./model.AuthoringFile')
var RateLimitTaskRunner = require('./RateLimitTaskRunner')

var exportJobsQueue = new RateLimitTaskRunner()

module.exports = (router) => {

    router.post('/exportJob', (req, res) => {
        res.send({received: true})
        // var exportJob_db = new ExportJob({
        //     authoringFile: req.authoringFile
        // })
        // exportJob_db.save() // TODO: handle save error
        // TODO: handle bug where job processed successfully before db save,
        //       which would result in job not being removed from db:
        //       job processed! > remove job from db > save job to db
        var exportJob = function(done) {
            axios.post("http://localhost:8081/convertToPDF", {
                authoringData: req.authoringData
                // authoringData: "xyz123"
            })
            .then(function(res) {
                // ExportJob.findByIdAndRemove(exportJob._id)
                // // TODO: above/below: handle errors
                // AuthoringFile.findByIdAndUpdate(req.authoringFile, {
                //     $set : { pdfData: res.data }
                // })
                done("success")
            })
            .catch(function(e) {
                if(e.code === 429) {
                    exportJobsQueue.push(exportJob)
                    done("error-429")
                }
                // TODO: handle non-429 errors
            })
        }
        exportJobsQueue.push(exportJob)
    })

}
