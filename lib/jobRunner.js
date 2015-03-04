// REPORT RUNNER
var Async = require('async');

var Batch = require('./batchLayer');
var Speed = require('./speedLayer');


var CronJob = require('cron').CronJob;

var internals = {};



internals.runJob = function(job){
    Async.series({
        batchRunReport: Async.apply(Batch.runReport, job.name),
        batchUpdateReport: Async.apply(Batch.updateReport, job.name),
        speedScrub: Async.apply(Speed.scrubData, job.name)
    }, function(err, results){
        console.log(results);
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
        // TO DO: add output term to agg pipeline
        internals.runJob(job)

        // run mongo agg
    }, null, true, job.timezone);

    next();
}
