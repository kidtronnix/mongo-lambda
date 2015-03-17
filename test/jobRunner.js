var ML = require('../lib');
var mongo = require('../lib/mongo');
var Batch = require('../lib/batchLayer');
var Lab = require('lab');
var Code = require('code');
var Async = require('async');


// Declare internals
var internals = {};
// Test shortcuts
var lab = exports.lab = Lab.script();
var before = lab.before;
var after = lab.after;
var describe = lab.describe;
var it = lab.it;
var expect = Code.expect;

internals.scrubMaster = function(next) {
    mongo.db.collection('hits').remove({}, function(err) {
        expect(err).to.not.exist();
        next(err);        
    })
}

internals.scrubSpeed = function(next) {
    mongo.db.collection('hitCount_delta').remove({}, function(err) {
        expect(err).to.not.exist();
        next(err);
    })
}

internals.scrubBatches = function(next) {
    mongo.db.collection('hitCount_batches').remove({}, function(err) {
        expect(err).to.not.exist();
        next(err);
    })
}

describe('Job Runner', function () {

    // var config = {
    //     host: 'localhost',
    //     port: 27017,
    //     db: 'mongo-lambda-test',
    //     masterColl: "hits"
    // };

    // var reports = [{
    //     name: "hitCount",
    //     agg: [{ $group: {_id: null, count: { $sum: 1 }}}],
    //     cron: "*/5 * * * * *",
    //     timezone: "US"
    // }];

    // before(function(done) {
        
    //     Async.series({
    //         insertReports: Async.apply(Batch.insertReports, reports),
    //         mongoInit: Async.apply(mongo.init, config),
    //         scrubMaster: internals.scrubMaster,
    //         scrubSpeed: internals.scrubSpeed,
    //         scrubBatches: internals.scrubBatches
    //     }, function(err, results) {
    //         expect(err).to.not.exist();
    //         done();
    //     });
    // });

    // it('batches data', { timeout: 7000}, function (done) {
    //     var lambda = new ML.Lambda(config);

    //     lambda.reports(reports);

    //     lambda.start(function() {
    //         setTimeout(function() {
    //             lambda.getResults('hitCount', {}, function(err, batches, onTheFly) {
    //                 expect(err).to.not.exist();
    //                 expect(batches).to.be.an.array();
    //                 expect(batches.length).to.equal(1);
    //                 done();
    //             });
    //         }, 5500);
    //     })
    // });
});
