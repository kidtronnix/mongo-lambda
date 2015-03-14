var ML = require('..');

var lambda = new ML.Lambda({
    masterCollection: "master",
    scrubAtStart: true
});

lambda.reports([{
    name: "docCount",
    agg: [{ $group: {_id: null, count: { $sum: 1 }}}],
    cron: "*/5 * * * * *",
    timezone: "US"
}]);


lambda.start(function() {
    setInterval(function() {
        lambda.insert({ua: "iphone"}, function(err, results) {
            if (err) {
                console.warn("ERROR DRIPING DATA: "+err.message);
            }
            console.log('drip')
        });
    }, 1000);
})
