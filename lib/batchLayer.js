
var Async = require('async');
var Hoek = require('hoek');
var mongo = require('./mongo');

var internals = {};
internals.reports = {};
internals._reports = [];

exports.detectReports = internals.detectReports = function(next) {
    if(!internals.reports || !Object.keys(internals.reports).length) {
        console.warn("No reports detected!");
        next(true);
    } else {
        next(null);
    }

}

exports.initBatches = internals.initBatches = function(next) {
  Async.each(internals._reports, function(report, callback) {
    mongo.batches[report.name].find({report: report.name}, {"limit": 1} ).sort({'to': -1}).toArray(function(err,batch) {
      if (err) {
        console.warn("ERROR LOOKING UP REPORT: "+err.message);
      }
      if(batch.length == 0) {
        module.exports.reports[report.name].lastReportTo = internals.reports[report.name].lastReportTo = new Date(); 
      } else {
        module.exports.reports[report.name].lastReportTo = internals.reports[report.name].lastReportTo = batch[0]['to'];
      }
      callback(err);
    });

  }, function(err) {
    next(err);
  });
}

module.exports.init = function (options, next) {

    module.exports.options = internals.options = options;

    Async.series({
        detectReports: internals.detectReports,
        initBatches: internals.initBatches
    }, function(err, results) {
        next(err, results);
    });
};

exports.insertData = function(data, next) {

    mongo.master.insert(data, {w:1}, function(err, objects) {
        if (err) {
            console.warn(" * Error inserting in master:", err);
        }
        next(err);
    });
}

exports.insertReports = function(reports, next) {
    module.exports._reports = internals._reports = reports;
    Async.each(reports, function(report, callback) {
        internals.reports[report.name] = report;
        module.exports.reports = internals.reports;
        callback();
    }, function() {
      next();
    })
}

internals.runAgg = function(report, next) {

    // Ammend agg 
    var from =  internals.reports[report.name].lastReportTo;
    var to = module.exports.reports[report.name].lastReportTo = internals.reports[report.name].lastReportTo = new Date();
    
    var agg = report.agg.slice();
    agg.unshift({ $match: {'_ts': {$gt: from, $lte: to }}});
    setTimeout(function(){
      mongo.master.aggregate(agg, function(err, data) {
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
    }, report.lateWindow);
}

exports.runReport = function(report, next) {

    Async.series({
        agg: Async.apply(internals.runAgg, report)
    }, function (err, result) {
        var batch = {
            report: report.name,
            from: result.agg.from,
            to: result.agg.to,
            data: result.agg.data
        }
        mongo.batches[report.name].insert(batch, {w:1}, function(err, doc) {
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
