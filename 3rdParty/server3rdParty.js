var express = require('express')

var app = express()
var server = app.listen(8081, function() {})

var router = express.Router()

var rateLimit = 500
var lastRequestTime = null
var requestCount = 0

router.post('/convertToPDF', (req, res) => {
    var now = new Date()
    var timeSinceLastRequest = now - lastRequestTime
    if( lastRequestTime !== null &&
        timeSinceLastRequest < rateLimit ) {
            res.status(429).send()
    } else {
        res.send("1234567")
    }
    lastRequestTime = now
    console.log('---------------------------')
    console.log(`Req #: ${++requestCount}`)
    console.log(`${timeSinceLastRequest} -> time since last request`)
    console.log(now)
    console.log()
})

app.use(router)
