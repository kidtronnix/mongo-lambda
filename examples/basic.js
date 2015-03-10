var ML = require('..');

var lambda = new ML.Lambda({
    masterCollection: "master",
    dataRetention: 2*60*1000,
    scrubCron: '*/20 * * * * *',
    scrubCronTimezone: 'US'
});

lambda.report({
    name: "job1",
    agg: [{ $group: {_id: null, count: { $sum: 1 }}}],
    cron: "*/5 * * * * *",
    timezone: "US"
});

lambda.start(function() {
    setInterval(function() {
        var query = { name: report.name }
        lambda.getResults('job1', query, function(err, batches, onTheFly) {
            if (err) {
                console.warn("ERROR GETTING REPORT: "+err.message);
            }
            var total = 0;

            batches.forEach(function(batch) {
                if (batch.data.length > 0) {
                    total = total + batch.data[0].count;
                }

            })
            console.log('batch layer: '+ total)

            if(onTheFly.length > 0) {
                console.log('speed layer: '+ onTheFly[0].count)
                total = total + onTheFly[0].count;
            }
            console.log('---------------------');
            console.log('TOTAL COUNT: '+total)
            console.log('---------------------\n');

        });
    }, 1000);
})


//
