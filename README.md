mongo-λ
--------

[![Build Status](https://travis-ci.org/smaxwellstewart/mongo-lambda.svg?branch=master)](https://travis-ci.org/smaxwellstewart/mongo-lambda)

***WARNING! EXPERIMENTAL WORK IN PROGRESS***

A mongo [lambda architecture](http://www.manning.com/marz/) implementation with simple API for providing mongo's aggregation pipepline reports. Written in javascript designed as an npm module.


### Usage

```js
var ML = require('mongo-lambda');

var lambda = new ML.Lambda({
    masterCollection: "hits",
    scrubAtStart: true
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
});
```

### Responsibilities of Module

 - Generating batch reports. Will run a [mongo aggregation pipeline](http://docs.mongodb.org/manual/core/aggregation-pipeline/) batch at scheduled `cron, using supplied `agg` object.
 - Scrub data from delta when bactch report is prooduced.

### API

### `.insert(data, callback)`

Will insert data into batch and speed layer's mongo collection.

### `.reports(reports, callback)`

Will insert report into system and start new cron job to run supplied agg.

### `.getResults('trendingTop100', [options], callback)`

#### NOTE

* *Live* means that the data is near realtime, I hesitate to use the word realtime because nothing is completely realtime.
