// REPORT RUNNER
var Async = require('async');

var Batch = require('./batchLayer');
var Speed = require('./speedLayer');


var CronJob = require('cron').CronJob;

var internals = {};

module.exports.init = function (options, next) {
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

exports.addJob = internals.addJob = function (reports, next) {
    reports.forEach(function(report) {
        new CronJob(report.cron, function() {
            internals.runJob(report)
        }, null, true, report.timezone);
    });

    next();
}
