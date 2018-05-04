var express = require('express')

var app = express()
var server = app.listen(8081, function() {})

var router = express.Router()

var rateLimit = 500
var lastRequestTime = null

router.post('/convertToPDF', (req, res) => {
    var now = new Date()
    if( lastRequestTime !== null &&
        now - lastRequestTime < rateLimit ) {
            res.status(429).send()
    } else {
        lastRequestTime = now
        res.send("1234567")
    }
})

app.use(router)
