mongo-lambda
-------------

[![Build Status](https://travis-ci.org/smaxwellstewart/mongo-lambda.svg?branch=master)](https://travis-ci.org/smaxwellstewart/mongo-lambda)

A [lambda architecture](http://www.manning.com/marz/) implementation for mongodb with simple API for providing mongo's aggregation pipepline reports. Written in javascript designed as an npm module.

version: ***beta***

### Data Model

The data model is based on an [stream processing / event sourcing](http://blog.confluent.io/2015/01/29/making-sense-of-stream-processing/) model. All data points are treated as immutable facts that are then aggregated into batches at regular intervals. This provides safety against dev mistakes when creating new reports, as raw data can be past processed at any point in the future. On top of this speed collections are created that temporarily store data until a batch aggregation has been produced, after this the raw data is cleared from the speed collection. This keeps the speed collections small in size, so quick to query for near *realtime* results.

### Usage

```js
var ML = require('mongo-lambda');

var lambda = new ML.Lambda({
    host: 'localhost',
    port: 27017,
    db: 'lambda-db',
    masterColl: "hits"
});

lambda.reports([{
    name: "hitCount",
    agg: [{ $group: {_id: null, count: { $sum: 1 }}}],
    cron: "*/5 * * * * *",
    timezone: "EST",
    startCron: true // default
}]);

lambda.start(function() {
    setInterval(function() {
        // Drip data
        lambda.insert({ua: "iphone"}, function(err, results) {
            
            // Get batches and live data
            Async.parallel({
                batches: Async.apply(lambda.batches, 'report4'),
                onTheFly: Async.apply(lambda.speedAgg, 'report4')
            }, function(err, results){
                var total = 0;

                results.batches.forEach(function(batch) {
                    if (batch.data.length > 0) {
                        total = total + batch.data[0].count;
                    }

                })

                if(results.onTheFly.length > 0) {
                    total = total + results.onTheFly[0].count;
                }

                console.log('---------------------');
                console.log('TOTAL COUNT: '+total)
                console.log('---------------------\n');
            });
        });
    }, 1000);
});
```

### Responsibilities of Module

 - Inserting data into master and and each reports speed collection. All data is timestamped by adding a  `_ts` field.
 - Generating batch reports. Will run a [mongo aggregation pipeline](http://docs.mongodb.org/manual/core/aggregation-pipeline/) batch at scheduled `cron`, using supplied `agg` object.
 - Scrub data from speed collection when bactch report is prooduced.

### API

#### `.reports(reports)`

Will insert array of reports into system and start new cron job to run using their supplied `agg`. A report has the following structure:

- name: Name of report, used to refer to later.
- agg: [Mongo aggregation pipeline](http://docs.mongodb.org/manual/core/aggregation-pipeline/) object.
- cron: Cron string that defines schedule of when aggregations are run. See [here](https://www.npmjs.com/package/cron) for allowed cron strings.
- timezone: The timezone of the cron job.
- startCron: Whether to start the cron (defaults to true), useful if you want to have separate instances for inserting and getting data.

#### `.start(callback)`

Starts Lambda instance, initialises cron jobs and mongodb. *NOTE!* This function must be called before you can insert or get data, ie before you can call any of the methods below.


#### `.insert(data, callback)`

Will insert data into batch and speed layer's mongo collection. Accepts data object or array of objects, just like mongodb's native insert. All data points are timestamped with `_ts` field unless already timestamped.

#### `.batches(report.name, callback)`

Get's batches of data produced by cron job. Callback has following signature: `function(err, batches)`.

#### `.speedAgg(report.name, callback)`

Get's a speed aggregation on speed collection, ie data that has not yet been batched. Callback has following signature: `function(err, speedAgg)`.

