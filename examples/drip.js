var ML = require('..');

var config = {
    batchLayer: {
        masterCollection: "master",
        batchesCollection: "batches",
        dataRetention: 24*60*60*1000
    },
    speedLayer: {
        collection: "delta"
    }
};

var lambda = new ML.Lambda(config, function(err) {
    setInterval(function() {
        lambda.insertData({ua: "iphone"}, function(err, results) {
            if (err) {
                console.warn("ERROR DRIPING DATA: "+err.message);
            }
            console.log('drip')
        });
    }, 1000);
})
