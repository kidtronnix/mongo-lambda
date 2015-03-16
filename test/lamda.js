var ML = require('../lib');
var Lab = require('lab');
var Code = require('code');
var Async = require('async');
var Batch = require('../lib/batchLayer');
var mongo = require('../lib/mongo');


// Declare internals
var internals = {};
// Test shortcuts
var lab = exports.lab = Lab.script();
var before = lab.before;
var beforeEach = lab.beforeEach;
var after = lab.after;
var describe = lab.describe;
var it = lab.it;
var expect = Code.expect;

internals.scrubMaster = function(next) {
    mongo.db.collection('master').remove({}, function(err, noDocs) {
        expect(err).to.not.exist();
        next(err);        
    })
}

internals.scrubSpeed = function(next) {
    mongo.db.collection('docCount_delta').remove({}, function(err, noDocs) {
        expect(err).to.not.exist();
        next(err);
    })
}

internals.scrubBatches = function(next) {
    mongo.db.collection('docCount_batches').remove({}, function(err, noDocs) {
        expect(err).to.not.exist();
        next(err);
    })
}


describe('Mongo Lambda API', function () {

    var config = {
        host: 'localhost',
        port: 27017,
        db: 'mongo-lambda-test',
        masterColl: "master"
    };

    var reports = [{
        name: "docCount",
        agg: [{ $group: {_id: null, count: { $sum: 1 }}}],
        cron: "*/5 * * * * *",
        timezone: "US"
    }];

    beforeEach(function(done) {
        console.log('runnng scrub')
        Async.series({
            insertReports: Async.apply(Batch.insertReports, reports),
            mongoInit: Async.apply(mongo.init, config),
            scrubMaster: internals.scrubMaster,
            scrubSpeed: internals.scrubSpeed,
            scrubBatches: internals.scrubBatches
        }, function(err, results) {
            expect(err).to.not.exist();
            done();
        });
    })

    it('validates good configuration', function (done) {
        var instance = function () {
            var lambda = new ML.Lambda(config);
        };
        expect(instance).to.not.throw();
        done()
    });

    it('invalidates bad configuration', function (done) {
        var badConfig = {};
        var instance = function () {
            var lambda = new ML.Lambda(badConfig);
        };
        expect(instance).to.throw();
        done()
    });


    it('insert a report and start', function (done) {
        var start = function () {
            var lambda = new ML.Lambda(config);

            lambda.reports(reports);

            lambda.start(function() {})
        };
        expect(start).to.not.throw();
        done();
    });

    it('inserts data into all collections', function (done) {
        var lambda = new ML.Lambda(config);

        lambda.reports(reports);

        lambda.start(function() {
            lambda.insert({ua: "specific"}, function(err, results) {
                mongo.master.find({ua: "specific"}).toArray(function(err, doc) {
                    expect(err).to.not.exist();
                    expect(doc).to.exist();
                    expect(doc.length).to.equal(1);

                    mongo.speed['docCount'].find({ua: "specific"}).toArray(function(err, doc) {
                        expect(err).to.not.exist();
                        expect(doc).to.exist();
                        expect(doc.length).to.equal(1);
                        done();
                    })
                })
            });
        })
    });

    // it('gets bactches and live data', { timeout: 7000}, function (done) {
    //     var lambda = new ML.Lambda(config);
    //     lambda.reports(reports);

    //     var data = {ua: "iphone"};

    //     lambda.start(function() {
    //         //Drip data
    //         var i = 0;
    //         setInterval(function() {
    //             console.log(new Date());
    //             lambda.insert(data, function(err, results) {
    //                 expect(err).to.not.exist();

    //                 lambda.getResults('docCount', {}, function(err, batches, onTheFly) {
    //                     i++;
    //                     expect(err).to.not.exist();
    //                     var total = 0;

    //                     batches.forEach(function(batch) {
    //                         if (batch.data.length > 0) {
    //                             total = total + batch.data[0].count;
    //                         }

    //                     })
    //                     console.log('batch layer: '+ total)

    //                     if(onTheFly.length > 0) {
    //                         console.log('speed layer: '+ onTheFly[0].count)
    //                         total = total + onTheFly[0].count;
    //                     }

    //                     console.log('---------------------');
    //                     console.log('TOTAL COUNT: '+total)
    //                     console.log('---------------------\n');

    //                     // expect(total).to.equal(i);
    //                 });
    //             });
    //         }, 1000);

    //         setTimeout(function() {
    //             done();
    //         }, 6500);

    //     })
    // });

});
