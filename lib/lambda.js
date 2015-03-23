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
    options = Schema.assert('config', options);
    internals.options = options;
}

// Interface
internals.Lambda.prototype.insert = function(data, callback) {
    var timestamp = new Date();

    if (data.constructor === Array) {
        var n = data.length
        for(var i = 0; i<n; i++) {
            data[i]._ts = timestamp;
        }
    } else {
        data._ts = timestamp;
        data = [data];
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

internals.Lambda.prototype.getResults = function(name, callback) {
    // TO DO: Validate query
    // TO DO : Validate report exists
    Async.parallel({
        batches: Async.apply(Batch.getBatches, name, {}),
        onTheFly: Async.apply(Speed.getOnTheFly, name, {})
    }, function(err, results){
        // var report = Serving.combine(results.batchGetReports);
        // TO DO ADD ERROR HANDLING
        callback(err, results.batches, results.onTheFly);
    });
}



internals.Lambda.prototype.start = function(callback) {
    Async.series({
        initBatch: Async.apply(Batch.init, internals.options),
        initDb: Async.apply(mongo.init, internals.options)
    }, function(err, results) {
        if (err) {
            throw new Error('Unable to start lambda');
        } else {
            callback();    
        }
    });
}
