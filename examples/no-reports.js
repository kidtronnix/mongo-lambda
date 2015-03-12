var ML = require('..');

var lambda = new ML.Lambda({
    masterCollection: "master",
    dataRetention: 2*60*1000,
    scrubCron: '*/20 * * * * *',
    scrubCronTimezone: 'US'
});



lambda.start(function() {
})
