var ML = require('..');

var lambda = new ML.Lambda({
    host: 'localhost',
    port: 27017,
    db: 'faps',
    masterColl: "searches"
});

lambda.reports([{
    name: "docCount",
    agg: [{ $group: {_id: null, count: { $sum: 1 }}}],
    cron: "*/5 * * * * *",
    timezone: "EST"
}]);

lambda.start(function() {
    //Drip data
    setInterval(function() {

        lambda.insert({ua: "iphone"}, function(err, results) {
            if (err) {
                console.warn("ERROR DRIPING DATA: "+err.message);
            }
        });
    }, 1000);
});
