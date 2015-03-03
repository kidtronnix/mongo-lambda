var ML = require('..');

var lambda = new ML.Lambda({
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
});

lambda.insertData({name: "simon"}, function(err, results) {
    console.log('* CLIENT SIDE: DONE!');
    console.log(results);
});

lambda.insertReport({
    name: "job2",
    agg: {},
    cron: "* * * * * *",
    timezone: "US"
},
function(err, results) {
    console.log('* CLIENT SIDE: Inserted report!');
    console.log(results);
});

//
// var report = {};
// function process(key,value) {
//     log(key + " : "+value);
// }
//
// function traverse(o,func) {
//     for (var i in o) {
//         func.apply(this,[i,o[i]]);
//         if (o[i] !== null && typeof(o[i])=="object") {
//             //going on step down in the object tree!!
//             traverse(o[i],func);
//         }
//     }
// }
