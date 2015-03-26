var ML = require('..');
var Nsq = require('nsqjs');

var lambda = new ML.Lambda({
    host: 'localhost',
    port: 27017,
    db: 'faps',
    masterColl: "searches"
});

var queue = new Nsq.Reader('sample_topic', 'test_channel', {
  lookupdHTTPAddresses: '127.0.0.1:4161'
});

lambda.start(function() {
	// Connect to NSQ
    queue.connect();
	queue.on('message', function (msg) {
		console.log('Received message [%s]: %s', msg.id, msg.body.toString());
		
	  	var data = msg.body.toString();
	  	lambda.insert(data, function(err, results) {
	        if (err) {
	            console.warn("ERROR INSERTING DATA: "+err.message);
	        }
	        msg.finish();
	    });
	});
});

