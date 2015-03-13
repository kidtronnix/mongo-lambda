mongo-λ
--------

[![Build Status](https://travis-ci.org/smaxwellstewart/mongo-lambda.svg?branch=master)](https://travis-ci.org/smaxwellstewart/mongo-lambda)

***WARNING! EXPERIMENTAL WORK IN PROGRESS***

A mongo [lambda architecture](http://www.manning.com/marz/) implementation with simple API for providing mongo's aggregation pipepline reports. Written in javascript designed as an npm module.


### Usage

```js
var ML = require('..');

var lambda = new ML.Lambda({ 
    masterCollection: "imps",
    srubAtStart: true
});

lambda.reports([{
    name: "job1",
    agg: [{ $group: {_id: null, count: { $sum: 1 }}}],
    cron: "*/5 * * * * *",
    timezone: "US"
}]);

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
```

### Responsibilities of Module

 - Generating recurring reports in batch layer. Will run using `$aggPipeline`.
 - Scrub data from batch (speed also) layer's master collections after it expires past `dataRentention`.
 - Scrub data from delta when batch agg is produced.

### API

### `.insert(data, callback)`

Will insert data into batch and speed layer's mongo collection.

### `.report(report, callback)`

Will insert report into system and start new cron job to run supplied agg.

### `.getResults('trendingTop100', [options], callback)`

Fetches a **"trendingTop100"** report this will use the supplied `combine` function.

#### NOTE

* *Live* means that the data is near realtime, I hesitate to use the word realtime because nothing is completely realtime.
