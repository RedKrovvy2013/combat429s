var mongoose = require('mongoose')

var ExportJobSchema = new mongoose.Schema({
    authoringFile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AuthoringFile'
    },
    attemptsCount: {
        type: Number,
        default: 0
    }
})

var ExportJob = mongoose.model('ExportJob', ExportJobSchema)

module.exports = ExportJob
