// Contructor Function
var Hoek = require('hoek');
var Async = require('async');
var Batch = require('./batchLayer');
var Speed = require('./speedLayer');
var JobRunner = require('./jobRunner');
var Schema = require('./schema');
var mongo = require('./mongo');
var internals = {};

exports = module.exports = internals.Lambda = function (options, callback) {

    Hoek.assert(this.constructor === internals.Lambda, 'Lambda must be instantiated using new');
    options = Schema.assert('options', options || {});

    this._settings = options;

    Async.series({
        initDb: Async.apply(mongo.init, options),
        initBatch: Async.apply(Batch.init, options),
        initJobRunner: Async.apply(JobRunner.init, options),
        batchScrub: Batch.scrubData,
        speedScrub: Async.apply(Speed.scrubData, true)
    }, callback);
}

// API

internals.Lambda.prototype.insertData = function(data, callback) {
    if(!data._ts) {
        data._ts = new Date();
    }

    Async.parallel({
        batchInsertData: Async.apply(Batch.insertData, data),
        speedInsertData:  Async.apply(Speed.insertData, data)
    }, callback);
}

internals.Lambda.prototype.insertReport = function(report, callback) {
    Schema.assert('report', report);

    Async.series({
        insertReport: Async.apply(Batch.insertReport, report),
        addJob: Async.apply(JobRunner.addJob, report)
    }, function(err, results){
        // Validations
        callback(null, results.insertReport);
    });
}

internals.Lambda.prototype.getReport = function(name, query, callback) {

    // TO DO: Validate query
    Async.parallel({
        batches: Async.apply(Batch.getBatches, query),
        onTheFly: Async.apply(Speed.getOnTheFly, name, query)
    }, function(err, results){
        // var report = Serving.combine(results.batchGetReports);
        // TO DO ADD ERROR HANDLING
        callback(null, results.batches, results.onTheFly);

    });
}



internals.Lambda.prototype.start = function(report, callback) {

}
