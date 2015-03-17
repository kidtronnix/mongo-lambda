var Batch = require('./batchLayer');
var mongo = require('./mongo');

exports.insertData = function(data, next) {
    Object.keys(Batch.reports).forEach(function(key) {
        var report = Batch.reports[key];
        mongo.speed[report.name].insert(data, {safe:true, dropDups: true}, function(err, objects) {
            if (err) {
                console.warn("ERROR INSERTING SPEED: "+err.message);
            }
            
        }); 
    });

    next(null);
}

exports.scrubData = function(report, next) {
    var query = {'_ts': {
        $lt: Batch.reports[report.name].lastReportTo
    } };

    mongo.speed[report.name].remove(query, {safe:true}, function(err, numDocs) {
        if (err) {
            console.warn("ERROR SCRUBBING SPEED: "+ err.message);
            next(err);
        } else {
            next(null);
        } 
    });
}

exports.getOnTheFly = function(name, query, next) {
    
    var agg = Batch.reports[name].agg;

    // Maybe re-enable?
    // if(query.from || query.to) {
    //     var match = { $match: {'_ts': {} }};
    //     if(query.from) {
    //         match.$match._ts['$gt'] =  query.from; 
    //     }

    //     if(query.to) {
    //         to = { $lte: query.to }
    //         match.$match._ts['$lte'] =  query.to; 
    //     }
    //     agg.unshift(match);
    // }

    mongo.speed[name].aggregate(agg, function(err, data) {
        if (err) {
            console.warn("AGGREGATION ERROR: "+err.message);
        }

        next(err, data);
    });
}
