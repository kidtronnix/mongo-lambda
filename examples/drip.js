var ML = require('..');

var lambda = new ML.Lambda({
    masterCollection: "master",
    dataRetention: 2*60*1000,
    scrubCron: '*/20 * * * * *',
    scrubCronTimezone: 'US'
})

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
