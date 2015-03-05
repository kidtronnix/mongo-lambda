var ML = require('..');

var config = {
    batchLayer: {
        collection: "master",
        dataRetention: 24*60*60*1000
    },
    speedLayer: {
        collection: "delta"
    },
    servingLayer: {
        combine: function(batchReports, liveDeltaReport) {
            console.log('* CLIENT SIDE: COMbINED!')
        }
    }
};

var lambda = new ML.Lambda(config, function(err) {
    setInterval(function() {
        lambda.insertData({ua: "iphone"}, function(err, results) {
            console.log('- inserted into lamda.');
        });
    }, 1000);
})
