var ML = require('..');

var config = {
    batchLayer: {
        collection: "master",
        dataRetention: 24*60*60*1000
    },
    speedLayer: {
        collection: "delta"
    },
    servingLayer: {
        combine: function(batchReports, liveDeltaReport) {
            console.log('* CLIENT SIDE: COMbINED!')
        }
    }
};

var lambda = new ML.Lambda(config, function(err) {

    lambda.insertData({name: "simon"}, function(err, results) {
        console.log('* CLIENT SIDE: DONE!');
        console.log(results);
    });

    lambda.insertReport({
        name: "job2",
        agg: {},
        cron: "*/10 * * * * *",
        timezone: "US"
    },
    function(err, results) {
        // console.log('* CLIENT SIDE: Inserted report!');
        // console.log(results);
    });

});


//
// lambda.insertReport({
//     name: "job1",
//     agg: {},
//     cron: "*/5 * * * * *",
//     timezone: "US"
// }, function(err, results) {
//     // console.log('* CLIENT SIDE: Inserted report!');
//     // console.log(results);
// });
