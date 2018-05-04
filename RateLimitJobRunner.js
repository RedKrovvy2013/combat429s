function RateLimitJobRunner() {
    this.jobs = []
    this.isProcessing = false
    this.isWaiting = false
    this.rateLimit = 2000
    this.highestErrRL = 0
    this.lowestSuccRL = null
    this.isRateLimitLocked = false
    this.isTrackingRL = false
}

RateLimitJobRunner.prototype.doWait = function() {
    console.log(this.rateLimit)
    this.isWaiting = true
    setTimeout(function() {
        this.isWaiting = false
        this.process()
    }.bind(this), this.rateLimit)
}

RateLimitJobRunner.prototype.setNewRateLimit = function(fetchResult) {
    console.log(fetchResult)
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
    if( this.lowestSuccRL - this.rateLimit < 50 ) {
        this.rateLimit = this.lowestSuccRL
        this.isRateLimitLocked = true
    }
}

// TODO: come up with some way to separate Job runner and rate limit responsibilities

RateLimitJobRunner.prototype.process = function() {
    if( this.isProcessing === false &&
              this.jobs.length > 0 &&
           this.isWaiting === false    ) {
        var fx = this.jobs.shift()
        this.isProcessing = true

        fx( function(fetchResult) {
            this.isProcessing = false
            if(this.isTrackingRL)
                this.setNewRateLimit(fetchResult)
            // -----------------
            if(this.jobs.length > 0)
                this.isTrackingRL = true
            else
                this.isTrackingRL = false
            this.doWait()
            // NOTE: acting as if rate limit based off of call completion;
            //       in reality, rate limit based off other server's tracking
            //       of time from their call process time point to another
            // TODO: re-engineer to handle above
        }.bind(this) )
    }
}

RateLimitJobRunner.prototype.push = function(job) {
    this.jobs.push(job)
    this.process()
}

module.exports = RateLimitJobRunner
