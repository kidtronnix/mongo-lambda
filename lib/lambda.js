// Contructor Function
var Hoek = require('hoek');
var Async = require('async');
var Batch = require('./batchLayer');
var Speed = require('./speedLayer');

var Schema = require('./schema');

var internals = {};

exports = module.exports = internals.Lambda = function (options) {

    Hoek.assert(this.constructor === internals.Lambda, 'Lambda must be instantiated using new');
    options = Schema.assert('options', options || {});

    // TO DO: Add defaults

    console.log("Lambda Instance Started: ")
    console.log(options);

    // Add stuff to this?
    // DO Controller stuff

    this._settings = options;
}

// API

internals.Lambda.prototype.insertData = function(data, callback) {
    if( data._ts != undefined ) {
        data._ts = new Date();
    }

    Async.parallel({
        batchInsertData: Async.apply(Batch.insertData, data),
        speedInsertData:  Async.apply(Speed.insertData, data)
    }, callback);
}

internals.Lambda.prototype.getReport = function(name, callback) {
    // TO DO: Validate report has been created first
    Async.parallel({
        batchGetReports: Async.apply(Batch.getReports, name),
        speedRunAgg: Async.apply(Speed.runAgg, name)
    }, function(err, results){
        var report = Serving.combine(results.speedGetReport, results.batchGetReports);
        // TO DO ADD ERROR HANDLING
        callback(null, report);

    });
}

internals.Lambda.prototype.newReport = function(report) {
    Schema.assert('report', report);

    Async.parallel({
        batchInsertReport: Async.apply(Batch.insertReport, name),
    }, function(err, results){
        // Validations
        callback(null, results.batchInsertReport);
    });
}
