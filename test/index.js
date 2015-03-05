var ML = require('../lib');
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


describe('Mongo Lambda', function () {
    it('validates good configuration', function (done) {
        var config = {
            batchLayer: {
                collection: "master",
                dataRetention: 24*60*60*1000
            },
            speedLayer: {
                collection: "delta"
            }
        };

        var lambda = new ML.Lambda(config, function(err) {
            expect(err).to.not.exist();
            done();
        })


    });
});
