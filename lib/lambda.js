// Contructor Function
var Hoek = require('hoek');
var Async = require('async');
var Batch = require('./batchLayer');
var Speed = require('./speedLayer');
var JobRunner = require('./jobRunner');
var Schema = require('./schema');
var mongo = require('./mongo');
var internals = {};

exports = module.exports = internals.Lambda = function (options) {

    Hoek.assert(this.constructor === internals.Lambda, 'Lambda must be instantiated using new');
    options = Schema.assert('config', options || {});

    internals.options = options;
}

// API

internals.Lambda.prototype.insert = function(data, callback) {
    if(!data._ts) {
        data._ts = new Date();
    }

    Async.parallel({
        batchInsertData: Async.apply(Batch.insertData, data),
        speedInsertData:  Async.apply(Speed.insertData, data)
    }, callback);
}

internals.Lambda.prototype.reports = function(reports) {
    Schema.assert('reports', reports);

    Async.series({
        insertReports: Async.apply(Batch.insertReports, reports),
        addJob: Async.apply(JobRunner.addJob, reports)
    }, function(err, results){
        // Validations
        if(err) {
            throw new Error('Error inserting reports!');
        }
    });
}

internals.Lambda.prototype.getResults = function(name, query, callback) {

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



internals.Lambda.prototype.start = function(callback) {
    // Schema.assert('reports', Batch.reports);

    // ADD VALIDATION
    Async.series({
        initDb: Async.apply(mongo.init, internals.options),
        initBatch: Async.apply(Batch.init, internals.options),
        initJobRunner: Async.apply(JobRunner.init, internals.options),
        batchScrub: Batch.scrubData,
        // speedScrub: Async.apply(Speed.scrubData, true)
    }, function(err, results) {
        callback(null);
    });
}
