var ML = require('../lib');
var mongo = require('../lib/mongo');
var Lab = require('lab');
var Code = require('code');


// Declare internals
var internals = {};
// Test shortcuts
var lab = exports.lab = Lab.script();
var before = lab.before;
var after = lab.after;
var describe = lab.describe;
var it = lab.it;
var expect = Code.expect;


describe('Mongo Lambda Job Runner', function () {

    var config = {
        batchLayer: {
            masterCollection: "master",
            batchesCollection: "batches",
            dataRetention: 1000,
            scrubCron: '* * * * * *',
            scrubCronTimezone: 'US'
        },
        speedLayer: {
            collection: "delta"
        }
    };

    it('scrubs data from batch layer', { timeout: config.batchLayer.dataRetention + 5000 }, function (done) {

        var agg = [{ $group: {_id: null, count: { $sum: 1 }}}];

        var report = {
            name: "job2",
            agg: JSON.stringify(agg),
            cron: "* * * * * *",
            timezone: "US"
        };


        var lambda = new ML.Lambda(config, function(err) {
            expect(err).to.not.exist();
            lambda.insertData({hit: "bingo"}, function(err, results) {
                expect(err).to.not.exist();
            });

            lambda.insertReport(report, function(err, results) {
                expect(err).to.not.exist();

                setTimeout(function(){
                    mongo.batchMaster.count(function(err, count) {
                        expect(count).to.equal(0);
                        done();
                    });
                }, config.batchLayer.dataRetention + 1000)
            });


        });
    });

    
});