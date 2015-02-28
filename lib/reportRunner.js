// REPORT RUNNER
var Batch = require('batchLayer');
var Speed = require('speedLayer');

var internals = {};

exports.run = function(name){

    Async.series({
        batchRunReport: Async.apply(Batch.runReport, name),
        batchUpdateReport: Async.apply(Batch.updateReport, name),
        speedScrub: Async.apply(Speed.scrubData, name)
    }, function(err, results){
        callback(null, results);

    });
}

// Ad checking function on time
