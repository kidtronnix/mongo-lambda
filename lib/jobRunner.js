// REPORT RUNNER
var Async = require('async');

var Batch = require('./batchLayer');
var Speed = require('./speedLayer');


var CronJob = require('cron').CronJob;

var internals = {};

internals.scrubData = function() {
    
}

module.exports.init = function (options, next) {
    // SCRUB CHECK
    new CronJob(Batch.options.scrubCron, function() {
        console.log('scrubbing data');
        
        Async.parallel({
            batchScrub: Batch.scrubData,
            speedScrub: Async.apply(Speed.scrubData, true)
        }, function(err, results){
            if (err) {
                console.warn("ERROR SCRUBBING DATA! ");
                console.warn(err.message);
            }          
        });
    }, null, true, Batch.options.scrubCronTimezone);

    next(null);
};

internals.runJob = function(report){
    Async.series({
        batchRunReport: Async.apply(Batch.runReport, report),
        speedScrub: Async.apply(Speed.scrubData, false)
    }, function(err, results){
        if (err) {
            console.warn("ERROR RUNNING JOB! ");
            console.warn("- report: ", report);
            console.warn(err.message);
        }
    });
}

exports.addJob = internals.addJob = function (report, next) {
    new CronJob(report.cron, function() {
        internals.runJob(report)
    }, null, true, report.timezone);

    next();
}
