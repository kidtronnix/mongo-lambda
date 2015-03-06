
var Hoek = require('hoek');
var mongo = require('./mongo');

var internals = {};

module.exports.init = function (options, callback) {
    internals.options = options;
    callback(null);
};


exports.insertData = function(data, next) {
    mongo.batchMaster.insert(data, {safe:true}, function(err, objects) {
        if (err) {
            console.warn(err.message);
        }
        next(err);
    });
}

exports.scrubData = function(data, next) {
    var now = new Date().getTime();
    var query = {
        _ts:  {
            $lt: new Date(now - internals.options.batchLayer.dataRetention)
        }
    }

    mongo.batchMaster.remove(query, {safe:true}, function(err, objects) {
        if (err) {
            console.warn("ERROR SCRUBBING BATCH: "+ err.message);
            next(err);
        }
        next(null, objects)
    });
}

exports.insertReport = function(report, next) {
    mongo.reports.insert(report, {safe:true}, function(err, objects) {
        if (err) {
            console.warn(err.message);
        }
        next(err);
    });
}

exports.updateReport = function(report, next) {
    mongo.reports.update({name: report.name}, report, {safe:true}, function(err, objects) {
        if (err) {
            console.warn(err.message);
        }
        next(err);
    });
}

exports.runReport = function(name, next) {
    setTimeout(function(){
        console.log('Batch report ran!');
        console.log(name);
        next(null, 1);
    }, 200);
}
