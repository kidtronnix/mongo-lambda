var ML = require('..');

var lambda = new ML.Lambda({
    masterCollection: "hits",
    scrubAtStart: false
});

lambda.reports([{
    name: "hitCount",
    agg: [{ $group: {_id: null, count: { $sum: 1 }}}],
    cron: "*/5 * * * * *",
    timezone: "US"
}]);

lambda.start(function() {
    //Drip data
    setInterval(function() {
        lambda.insert({ua: "iphone"}, function(err, results) {
            if (err) {
                console.warn("ERROR DRIPING DATA: "+err.message);
            }
            
            console.log(' imp!');
            console.log('---------------------');
            
        });
    }, 1000);

    // Get Results
    setInterval(function() {
        var query = { name: 'hitCount' }
        lambda.getResults('hitCount', query, function(err, batches, onTheFly) {
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
