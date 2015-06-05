var ML = require('..');

var lambda = new ML.Lambda({
    url: 'mongodb://localhost:27017/mongo-lambda-test',
    masterColl: "searches"
});

lambda.reports([{
    name: "docCount",
    agg: [{ $group: {_id: null, count: { $sum: 1 }}}],
    cron: "*/5 * * * * *",
    timezone: "EST",
    startCron: true
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
