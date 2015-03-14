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



});
