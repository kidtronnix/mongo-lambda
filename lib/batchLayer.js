
var Async = require('async');
var Hoek = require('hoek');
var mongo = require('./mongo');

var internals = {};
internals.reports = {};



module.exports.init = function (options, callback) {
    module.exports.options = internals.options = options;
    internals.reports = {};
    callback(null);
};

exports.insertData = function(data, next) {
    mongo.master.insert(data, {safe:true}, function(err, objects) {
        if (err) {
            console.warn(err.message);
        }
        next(err);
    });
}

exports.insertReports = function(reports, next) {
    reports.forEach(function(report) {
        internals.reports[report.name] = report;
        module.exports.reports = internals.reports;
    })
    
    next();
}


exports.scrubData = function(next) {
    var now = new Date().getTime();
    var query = {
        _ts:  {
            $lte: new Date(now - internals.options.dataRetention)
        }
    }

    mongo.master.remove(query, {safe:true}, function(err, numDocs) {
        if (err) {
            console.warn("ERROR SCRUBBING BATCH: "+ err.message);
            next(err);
        }
        next(null, numDocs)
    });
}


internals.runAgg = function(agg, from, next) {
    // Ammend agg
    
    agg.unshift({ $match: {'_ts': {$gt: from }}});

    mongo.master.aggregate(agg, function(err, data) {
        if (err) {
            console.warn("AGGREGATION ERROR: "+err.message);
        }
        var batch = {
            from: from,
            data: data
        }
        next(err, batch);
    });
}

internals.getDateFrom = function(report, next) {
    
    mongo.batches[report.name].find({report: report.name}, {"limit": 1} ).sort({'to': -1}).toArray(function(err,batch) {
        if (err) {
            console.warn("ERROR LOOKING UP REPORT: "+err.message);
            next(err);
        }

        if(batch.length == 0) {
            // date range agg
            var agg = {
                $group: {
                    _id: null,
                    from: { $min: "$_ts"},
                }
            }

            mongo.master.aggregate(agg,function(err, result) {
                if (err) {
                    console.warn("AGGREGATION ERROR: "+err.message);
                    next(err);
                }
                
                if (result.length > 0) {
                    // Take old to date as new from
                    var from = result[0]['from']
                } else {
                    var from = new Date();
                }
                 
                next(null, report.agg, from);
            });
        } else {
            next(null, report.agg, batch[0]['to']);
        }
    });
}

exports.runReport = function(report, next) {
    
    var batch = {
        report: report.name,
        to: new Date()
    }

    Async.waterfall([
        Async.apply(internals.getDateFrom, report),
        internals.runAgg
    ], function (err, result) {

        batch.from = result.from;
        batch.data = result.data;
        mongo.batches[report.name].insert(batch, {safe:true}, function(err, doc) {
            if (err) {
                console.warn(err.message);
            }
            next(err, doc[0]);
        });   
    });
}


exports.getBatches = function(query, next) {
    var q = {
        report: query.name
    };

    if(query.from) {
        q.from = { $gte: query.from }
    }
    if(query.to) {
        q.to = { $lte: query.to }
    }
    mongo.batchBatches.find(q).sort({'to': 1}).toArray(function(err, batches) {
        if (err) {
            console.warn("ERROR LOOKING UP BATCHES: "+err.message);
            next(err);
        }

        next(null, batches);
    });
}
