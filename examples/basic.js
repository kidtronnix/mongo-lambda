var ML = require('..');

var config = {
    batchLayer: {
        masterCollection: "master",
        batchesCollection: "batches",
        dataRetention: 2*60*1000
    },
    speedLayer: {
        collection: "delta"
    }
};

var lambda = new ML.Lambda(config, function(err) {

    var agg = [{ $group: {_id: null, count: { $sum: 1 }}}];

    var report = {
        name: "job1",
        agg: JSON.stringify(agg),
        cron: "*/5 * * * * *",
        timezone: "US",
        combine: function(batches) {
            return 6;
        }
    };
    
    lambda.insertReport(report, function(err, results) {
        // console.log('* CLIENT SIDE: Inserted report!');
        // console.log(results);

        setInterval(function() {
            var query = { name: report.name }
            lambda.getReport(query, function(err, results) {
                if (err) {
                    console.warn("ERROR GETTING REPORT: "+err.message);
                }
                var total = 0;
                results.forEach(function(batch) {
                    batch.data.forEach(function(batchData) {
                        total = total + batchData.count
                    })
                })
                console.log('REPORT: '+ total)
            });
        }, 1000);
    });

});


//
