var ML = require('../lib');
var Lab = require('lab');
var Code = require('code');
var mongo = require('../lib/mongo');


// Declare internals
var internals = {};
// Test shortcuts
var lab = exports.lab = Lab.script();
var before = lab.before;
var after = lab.after;
var describe = lab.describe;
var it = lab.it;
var expect = Code.expect;


describe('Mongo Lambda API', function () {

    var config = {
        masterCollection: "master",
        dataRetention: 2*60*1000,
        scrubCron: '*/20 * * * * *',
        scrubCronTimezone: 'US'
    };

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

            lambda.reports([{
                name: "docCount",
                agg: [{ $group: {_id: null, count: { $sum: 1 }}}],
                cron: "*/5 * * * * *",
                timezone: "US"
            }]);

            lambda.start(function() {})
        };
        expect(start).to.not.throw();
        done();
    });

    it('inserts data into all collections', function (done) {
        var lambda = new ML.Lambda(config);

        lambda.reports([{
            name: "docCount",
            agg: [{ $group: {_id: null, count: { $sum: 1 }}}],
            cron: "*/5 * * * * *",
            timezone: "US"
        }]);

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

    // it('throws error if no reports configured', function (done) {
    //
    //     var lambda = new ML.Lambda(config);
    //
    //     var start = function() {
    //         lambda.start(function(){});
    //     }
    //
    //     expect(start).to.throw();
    //     done();
    // });
});
