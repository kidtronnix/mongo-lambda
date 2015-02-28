var Serving = require('./servingLayer');

exports.options = {
    batchLayer: {
        collection: "master",
        dataRetention: 24*60*60*1000
    },
    speedLayer: {
        collection: "delta"
    },
    servingLayer: {
        combine: Serving.defaultCombine
    }
};
