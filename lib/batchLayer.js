
var Async = require('async');
var Hoek = require('hoek');
var mongo = require('./mongo');

var internals = {};
internals.reports = {};

exports.detectReports = internals.detectReports = function(next) {
    if(!internals.reports || !Object.keys(internals.reports).length) {
        console.warn("No reports detected!");
        next(true);
    } else {
        next(null);
    }

}

module.exports.init = function (options, next) {

    module.exports.options = internals.options = options;

    Async.series({
        detectReports: internals.detectReports
    }, function(err, results) {
        next(err, results);
    });
};

exports.insertData = function(data, next) {
    mongo.master.insert(data, {safe:true, dropDups: true}, function(err, objects) {
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

internals.runAgg = function(report, from, next) {

    // Ammend agg
    report.agg.unshift({ $match: {'_ts': {$gte: from }}});
    module.exports.reports[report.name].lastReportTo = internals.reports[report.name].lastReportTo = new Date();

    mongo.master.aggregate(report.agg, function(err, data) {
        if (err) {
            console.warn("AGGREGATION ERROR: "+err.message);
        }
        
        var batch = {
            from: from,
            to: internals.reports[report.name].lastReportTo,
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

                next(null, report, from);
            });
        } else {
            next(null, report, batch[0]['to']);
        }
    });
}

exports.runReport = function(report, next) {

    Async.waterfall([
        Async.apply(internals.getDateFrom, report),
        internals.runAgg
    ], function (err, result) {
        var batch = {
            report: report.name,
            from: result.from,
            to: result.to,
            data: result.data
        }

        mongo.batches[report.name].insert(batch, {safe:true}, function(err, doc) {
            if (err) {
                console.warn(err.message);
            }
            next(err, doc[0]);
        });
    });
}


exports.getBatches = function(name, query, next) {
    var q = {
        report: name
    };

    // Re-enable?
    // if(query.from) {
    //     q.from = { $gte: query.from }
    // }
    // if(query.to) {
    //     q.to = { $lte: query.to }
    // }
    
    mongo.batches[name].find(q).sort({'to': 1}).toArray(function(err, batches) {
        if (err) {
            console.warn("ERROR LOOKING UP BATCHES: "+err.message);
        }

        next(err, batches);
    });
}
