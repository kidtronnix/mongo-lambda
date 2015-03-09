var Batch = require('./batchLayer');
var mongo = require('./mongo');

exports.insertData = function(data, next){
    mongo.speedDelta.insert(data, {safe:true}, function(err, objects) {
        if (err) {
            console.warn(err.message);
        }
        next(err);
    });
}

exports.scrubData = function(expiration, next) {
    console.log(' - scrubbing speed...');
    var query = {}
    if(expiration) {
        var now = new Date().getTime();
        query = {
            _ts:  {
                $lte: new Date(now - Batch.options.dataRetention)
            }
        }
    }

    mongo.speedDelta.remove(query, {safe:true}, function(err, numDocs) {
        if (err) {
            console.warn("ERROR SCRUBBING SPEED: "+ err.message);
            next(err);
        }
        next(null, numDocs)
    });
}

exports.getOnTheFly = function(name, query, next) {

    // Ammend agg
    var agg = JSON.parse(Batch.reports[name].agg);

    if(query.from || query.to) {
        var match = { $match: {'_ts': {} }};
        if(query.from) {
            match.$match._ts['$gte'] =  query.from; 
        }

        if(query.to) {
            to = { $lte: query.to }
            match.$match._ts['$lte'] =  query.to; 
        }
        agg.unshift(match);
    }

    mongo.speedDelta.aggregate(agg, function(err, data) {
        if (err) {
            console.warn("AGGREGATION ERROR: "+err.message);
        }

        next(err, data);
    });
}
