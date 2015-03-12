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





describe('Job Runner', function () {

    var config = {
        masterCollection: "master",
        dataRetention: 2*1000,
        scrubCron: '* * * * * *',
        scrubCronTimezone: 'US'
    };

    it('scrubs data from batch layer', { timeout: config.dataRetention + 5000 }, function (done) {

        var lambda = new ML.Lambda(config);

        lambda.reports([{
            name: "docCount",
            agg: [{ $group: {_id: null, count: { $sum: 1 }}}],
            cron: "*/5 * * * * *",
            timezone: "US"
        }]);


        lambda.start(function() {
            lambda.insert({ua: "iphone"}, function(err, results) {
            });
            setTimeout(function(){
                mongo.master.count(function(err, count) {
                    console.log('COUNTING')
                    expect(count).to.equal(0);
                    done();
                });
            }, config.dataRetention + 1000);
        })
    });


});
