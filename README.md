mongo-λ **EXPERIMENTAL**
------------------------

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
		collection: "delta",
	},
	serveringLayer: {
		combine: function(precomputed, onTheFly) {
			// precomputed comes from onTheFly
		}
	}
}
```

### Responsibilities of Module

Report Runner
 - Generating recurring reports in batch layer. Will run using supplied `$aggPipeline` in config.


Data Management
 - Scrub data from batch layer's master collection after `expires`.
 - Scrub data from delta when batch view is produced.

Public Methods
- Expose the methods to the API:

### API

### `.insert(data)`

Will run a  data point into both `master` collection and `delta` collection.

### `.report("trendingTop100")`

Fetches a **"trendingTop100"** report, this will use the supplied `combine` function.

#### NOTE

* *Live* means that the data is near realtime, i hesitate to use the word realtime because nothing is completely realtime.
