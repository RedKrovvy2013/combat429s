
// NOTE: for reference: TaskRunner used as starting point to build RateLimitJobRunner

function TaskRunner() {
    this.tasks = []
    this.isProcessing = false
}

TaskRunner.prototype.process = function() {
    if( this.isProcessing === false && this.tasks.length > 0 ) {
        var fx = this.tasks.shift()
        this.isProcessing = true

        fx( function() {
            this.isProcessing = false
            this.process()
        }.bind(this) )
    }
}

TaskRunner.prototype.push = function(task) {
    this.tasks.push(task)
    this.process()
}

//  NOTE: works so that asynch/synch tasks are processed one at a time


/* NOTE: user could errantly call done() within executing task,
         which would lead to a process() call which would then stop quickly
         due to tasks.length equaling 0
*/
TaskRunner.prototype.abort = function() {
    this.tasks = []
    this.isProcessing = false
}

module.exports = TaskRunner
