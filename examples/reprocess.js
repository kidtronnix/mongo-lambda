var Wreck = require('wreck');
var ML = require('..');

var lambda = new ML.Lambda({
    url: 'mongodb://localhost:27017/mongo-lambda-test',
    masterColl: "searches"
});

lambda.reports([{
    name: "docCount",
    agg: [{ $group: {_id: '$ua', count: { $sum: 1 }}}],
    cron: "*/1 * * * *",
    timezone: "EST",
    startCron: false
}]);

var start = new Date();
var dates = [start];
for(var i = 1; i < 10; i++) {
  dates.push(new Date(start.getTime() - i * 1000));
}

lambda.start(function() {
    lambda.reprocess('docCount', dates, function() {
      console.log('done reprocessing!');
      process.exit(0);
    });
});
