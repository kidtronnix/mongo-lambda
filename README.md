mongo-λ
--------

[![Build Status](https://travis-ci.org/smaxwellstewart/mongo-lambda.svg?branch=master)](https://travis-ci.org/smaxwellstewart/mongo-lambda)

***WARNING! EXPERIMENTAL WORK IN PROGRESS***

A mongo [lambda architecture](http://www.manning.com/marz/) implementation with simple API for providing mongo's aggregation pipepline reports. Written in javascript designed as an npm module.

### Model Implementation

```js
{
	reports: [
	{
		name: "trending",
		agg: $aggPipeline,
		frequency: 60*60*1000
	}],
	batchLayer: {
		collection: "master",
		dataRetention: 24*60*60*1000
	},
	speedLayer: {
		collection: "delta"
	},
	servingLayer: {
		combine: function(batchReports, liveDeltaReport) {
		}
	}
}
```

### Responsibilities of Module

Report Runner
 - Generating recurring reports in batch layer. Will run using `$aggPipeline`.
 - Combine report method.


Data Management
 - Scrub data from batch layer's master collection after it expires past `dataRentention`.
 - Scrub data from delta when batch view is produced.

### API

### `.insertData(data)`

Will insert data point into batch and speed layer's mongo collection.

### `.getReport("trendingTop100")`

Fetches a **"trendingTop100"** report this will use the supplied `combine` function.

#### NOTE

* *Live* means that the data is near realtime, I hesitate to use the word realtime because nothing is completely realtime.
