var Wreck = require('wreck');
var ML = require('..');

var lambda = new ML.Lambda({
    host: 'localhost',
    port: 27017,
    db: 'faps',
    masterColl: "searches"
});

lambda.reports([{
    name: "mostPopular",
    // Basic aggregation to squash data as much as possible without losing any information
    agg: [ 
	    { 
	        $project : { 
	            keyword : 1,
	            s: { $cond: { if: { $eq: [ "$segment", "s" ] }, then: 1, else: 0 }},
	            g: { $cond: { if: { $eq: [ "$segment", "g" ] }, then: 1, else: 0 }},
	            t: { $cond: { if: { $eq: [ "$segment", "t" ] }, then: 1, else: 0 }}
	        }
	    },
	    { 
	        $group : { _id : "$keyword", hits: { $sum : 1}, s : { $sum : "$s" }, t : { $sum : "$t" }, g : { $sum : "$g" } } 
	    },
	    { 
	        $sort : { hits : -1} 
	    }
	],
    cron: "*/15 * * * *",
    timezone: "EST"
}]);

lambda.start(function() {
    // Scrape data every 2 secs
    setInterval( function() {  

    	Wreck.get('http://www.pornmd.com/getliveterms', function (err, res, payload) {
		    /* do stuff */
		    if(err) {
		    	return console.log('SCRAPE ERROR: ', err)
		    }

		    console.log(' * SCRAPE: '+ new Date());
		    var data = JSON.parse(payload);
		    lambda.insert(data, function(err, results) {
	            if (err) {
	                console.warn("ERROR DRIPING DATA: "+err.message);
	            }
	        }); 
		}); 	
	}, 2000);
});