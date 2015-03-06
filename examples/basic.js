var ML = require('..');

var config = {
    batchLayer: {
        collection: "master",
        dataRetention: 60*1000
    },
    speedLayer: {
        collection: "delta"
    }
};

var lambda = new ML.Lambda(config, function(err) {
    
    lambda.insertReport({
        name: "job1",
        agg: {},
        cron: "*/5 * * * * *",
        timezone: "US",
        combine: function() {

        }
    }, function(err, results) {
        // console.log('* CLIENT SIDE: Inserted report!');
        // console.log(results);
    });

});


//
