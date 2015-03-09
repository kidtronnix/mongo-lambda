var ML = require('..');

var config = {
    batchLayer: {
        masterCollection: "master",
        batchesCollection: "batches",
        dataRetention: 2*60*1000,
        scrubCron: '*/20 * * * * *',
        scrubCronTimezone: 'US'
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
        timezone: "US"
    };
    
    lambda.insertReport(report, function(err, results) {
        // console.log('* CLIENT SIDE: Inserted report!');
        // console.log(results);

        setInterval(function() {
            var query = { name: report.name }
            lambda.getReport('job1', query, function(err, batches, onTheFly) {
                if (err) {
                    console.warn("ERROR GETTING REPORT: "+err.message);
                }
                var total = 0;

                batches.forEach(function(batch) {
                    if (batch.data.length > 0) {
                        total = total + batch.data[0].count;
                    }
                    
                })
                console.log('- batch count: '+ total)

                if(onTheFly.length > 0) {
                    console.log('- speed count: '+ onTheFly[0].count)
                    total = total + onTheFly[0].count;
                }
                console.log('---------------------');
                console.log('TOTAL COUNT: '+total)
                console.log('---------------------\n');
                
            });
        }, 1000);
    });

});


//
