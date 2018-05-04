var mongoose = require('mongoose')

var AuthoringFileSchema = new mongoose.Schema({
    title: String,
    data: String,
    owner: String, //would be ref to User model, if existed
    exportFile: String
})

var AuthoringFile = mongoose.model('AuthoringFile', AuthoringFileSchema)

module.exports = AuthoringFile
