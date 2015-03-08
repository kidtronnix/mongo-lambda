var mongo = require('./mongo');

exports.insertData = function(data, next){
    mongo.speedDelta.insert(data, {safe:true}, function(err, objects) {
        if (err) {
            console.warn(err.message);
        }
        next(err);
    });
}

exports.scrubData = function(next){

    mongo.speedDelta.remove({}, {safe:true}, function(err, numDocs) {
        if (err) {
            console.warn("ERROR SCRUBBING SPEED: "+ err.message);
            next(err);
        }
        next(null, numDocs)
    });
}

exports.getOnTheFly = function(query, agg, next){

    // Ammend agg
    var agg = JSON.parse(agg);

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

    mongo.batchMaster.aggregate(agg, function(err, data) {
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
