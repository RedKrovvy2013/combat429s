function RateLimitJobRunner() {
    this.jobs = []
    this.isProcessing = false
    this.isWaiting = false
    this.rateLimit = 2000
    // NOTE: better name for rateLimit could be rateLimit not including
    //       processing & communication time between machines
    this.highestErrRL = 0
    this.lowestSuccRL = null
    this.isRateLimitLocked = false
    this.isTrackingRL = false
    this.RL_diffStoppingPoint = 100
}

RateLimitJobRunner.prototype.doWait = function() {
    this.isWaiting = true
    setTimeout(function() {
        this.isWaiting = false
        this.process()
    }.bind(this), this.rateLimit)
}

RateLimitJobRunner.prototype.setNewRateLimit = function(fetchResult) {
    if(this.isRateLimitLocked)
        return
    if(fetchResult==="error-429" && this.lowestSuccRL === null) {
        this.highestErrRL = this.rateLimit
        this.rateLimit += 1000
        return
    }
    if(fetchResult==="success") {
        this.lowestSuccRL = this.rateLimit
        this.rateLimit = this.highestErrRL + (this.rateLimit - this.highestErrRL) / 2
    }
    if(fetchResult==="error-429") {
        this.highestErrRL = this.rateLimit
        this.rateLimit = this.rateLimit + (this.lowestSuccRL - this.rateLimit) / 2
    }
    if( this.lowestSuccRL - this.rateLimit < this.RL_diffStoppingPoint ) {
        // console.log('------found rate limit stopping point------------')
        // console.log(this.highestErrRL)
        // console.log(this.lowestSuccRL)
        // console.log(this.rateLimit)
        // console.log('------found rate limit stopping point------------')
        this.rateLimit = this.lowestSuccRL
        this.isRateLimitLocked = true
    }
}

// TODO: come up with some way to separate Job runner and rate limit responsibilities

var requestCount = 0
RateLimitJobRunner.prototype.process = function() {
    if( this.isProcessing === false &&
              this.jobs.length > 0 &&
           this.isWaiting === false    ) {
        var job = this.jobs.shift()
        this.isProcessing = true

        job( function(fetchResult) {
            if(fetchResult==="error-429")
                this.push(job)
                // must do above before setting isProcessing to false, directly below
            // -----------------
            this.isProcessing = false
            if(this.isTrackingRL)
                this.setNewRateLimit(fetchResult)
            // -----------------
            if(this.jobs.length > 0)
                this.isTrackingRL = true
            else
                this.isTrackingRL = false
            this.doWait()
            console.log("----------------------")
            console.log(`Job #: ${job.no}`)
            console.log(`Req #: ${++requestCount}`)
            console.log(fetchResult)
            console.log(new Date())
            console.log(this.rateLimit)
        }.bind(this) )
    }
}

RateLimitJobRunner.prototype.push = function(job) {
    this.jobs.push(job)
    this.process()
}

module.exports = RateLimitJobRunner
