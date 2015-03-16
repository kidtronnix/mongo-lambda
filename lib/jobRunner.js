// REPORT RUNNER
var Async = require('async');

var Batch = require('./batchLayer');
var Speed = require('./speedLayer');


var CronJob = require('cron').CronJob;

var internals = {};

internals.runJob = function(report){
    Async.series({
        batchRunReport: Async.apply(Batch.runReport, report),
        speedScrub: Async.apply(Speed.scrubData, report)
    }, function(err, results){
        if (err) {
            console.warn("ERROR RUNNING JOB! ");
            console.warn("- report: ", report);
            console.warn(err.message);
        }
    });
}

exports.addJob = internals.addJob = function (reports, next) {
    reports.forEach(function(report) {
        new CronJob(report.cron, function() {
            internals.runJob(report)
        }, null, true, report.timezone);
    });

    next();
}
