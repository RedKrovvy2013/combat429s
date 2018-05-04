function RateLimitTaskRunner() {
    this.tasks = []
    this.isProcessing = false
    this.isWaiting = false
    this.rateLimit = 2000
    this.highestErrRL = 0
    this.lowestSuccRL = null
    this.isRateLimitLocked = false
    this.isTrackingRL = false
}

RateLimitTaskRunner.prototype.doWait = function() {
    console.log('x')
    this.isWaiting = true
    setTimeout(function() {
        this.isWaiting = false
        this.process()
    }.bind(this), this.rateLimit)
}

RateLimitTaskRunner.prototype.setNewRateLimit = function(fetchResult) {
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

// TODO: come up with some way to separate task runner and rate limit responsibilities

RateLimitTaskRunner.prototype.process = function() {
    if( this.isProcessing === false &&
              this.tasks.length > 0 &&
           this.isWaiting === false    ) {
        var fx = this.tasks.shift()
        this.isProcessing = true

        fx( function(fetchResult) {
            this.isProcessing = false
            if(this.isTrackingRL)
                this.setNewRateLimit(fetchResult)
            // -----------------
            if(this.tasks.length > 0)
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

RateLimitTaskRunner.prototype.push = function(task) {
    this.tasks.push(task)
    this.process()
}

module.exports = RateLimitTaskRunner
