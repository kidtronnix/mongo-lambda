// REPORT RUNNER
var Async = require('async');

var Batch = require('./batchLayer');
var Speed = require('./speedLayer');


var CronJob = require('cron').CronJob;

var internals = {};



internals.run = function(name){

    Async.series({
        batchRunReport: Async.apply(Batch.runReport, name),
        batchUpdateReport: Async.apply(Batch.updateReport, name),
        speedScrub: Async.apply(Speed.scrubData, name)
    }, function(err, results){
        callback(null, results);

    });
}

exports.start = function (getJobs, next) {
    // Get all reports in system and add them as cron jobs
    Async.map(getJobs, internals.addJob, function(err, result){
        next(null, result);
    });

}

exports.addJob = internals.addJob = function (job, next) {
    new CronJob(job.cron, function() {
        // PUT recurring job

        // TO DO: add output term to pipeline

        // DEBUG
        console.log('Running job: ');
        console.log(' - name: ', job.name);
        console.log(' - agg: ', job.agg);

        // run mongo agg
    }, null, true, job.timezone);

    next();
}

// Returns report in system not data
exports.getJobs = function(next) {
    var jobs = [
    {
        name: "trending100",
        agg: "addDagger",
        cron: "* * * * * *",
        timezone: "US"
    }];

    next(null, jobs);
}





// Ad checking function on time
