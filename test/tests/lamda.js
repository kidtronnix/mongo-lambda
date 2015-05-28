var ML = require('../../lib');
var Lab = require('lab');
var Code = require('code');
var Async = require('async');
var Batch = require('../../lib/batchLayer');
var mongo = require('../../lib/mongo');


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

var testReports = internals.testReports = require('../reports.js');

internals.scrubMaster = function(next) {
    mongo.db.collection('master').remove({}, function(err, noDocs) {
        expect(err).to.not.exist();
        next(err);
    })
}

internals.scrubSpeed = function(next) {
    Object.keys(testReports).forEach(function(key) {
      mongo.db.collection(testReports[key].name+'_delta').remove({}, function(err, noDocs) {
        expect(err).to.not.exist();
      });
    });

    next();

}

internals.scrubBatches = function(next) {
    Object.keys(testReports).forEach(function(key) {
      mongo.db.collection(testReports[key].name+'_batches').remove({}, function(err, noDocs) {
        expect(err).to.not.exist();
      });
    });

    next();

}


describe('Mongo Lambda', function () {

    var config = {
        url: 'mongodb://localhost:27017/mongo-lambda-test',
        masterColl: "master"
    };

    beforeEach(function(done) {
      var testsArray = [];
      Object.keys(testReports).forEach(function(key) {
        testsArray.push(testReports[key])
      });
        Async.series({
            insertReports: Async.apply(Batch.insertReports, testsArray),
            mongoInit: Async.apply(mongo.init, config),
            scrubMaster: internals.scrubMaster,
            scrubSpeed: internals.scrubSpeed,
            scrubBatches: internals.scrubBatches
        }, function(err, results) {
            expect(err).to.not.exist();
            done();
        });
    });

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


    it('can start', function (done) {
        var start = function () {
            var lambda = new ML.Lambda(config);

            lambda.reports([testReports.startTest]);

            lambda.start(function() {})
        };
        expect(start).to.not.throw();
        done();
    });

    it('inserts data into master collections', function (done) {
        var lambda = new ML.Lambda(config);

        lambda.reports([testReports.insertMasterTest]);

        lambda.start(function() {
            lambda.insert({ua: "specific"}, function(err, results) {
                mongo.master.find({ua: "specific"}).toArray(function(err, doc) {
                    expect(err).to.not.exist();
                    expect(doc).to.exist();
                    expect(doc.length).to.equal(1);
                    done();
                })
            });
        })
    });

    it('inserts array of data into master collections', function (done) {
        var lambda = new ML.Lambda(config);

        lambda.reports([testReports.insertMasterTest]);

        lambda.start(function() {
            lambda.insert([{ua: "specific2"}, {ua: "specific2"}], function(err, results) {
                mongo.master.find({ua: "specific2"}).toArray(function(err, doc) {
                    expect(err).to.not.exist();
                    expect(doc).to.exist();
                    expect(doc.length).to.equal(2);
                    done();
                })
            });
        })
    });

    it('inserts data into speed collections', function (done) {
        var lambda = new ML.Lambda(config);

        lambda.reports([testReports.insertSpeedTest]);

        lambda.start(function() {
            lambda.insert({ua: "specific"}, function(err, results) {
                mongo.speed[testReports.insertSpeedTest.name].find({ua: "specific"}).toArray(function(err, doc) {
                    expect(err).to.not.exist();
                    expect(doc).to.exist();
                    expect(doc.length).to.equal(1);
                    done();
                })
            });
        })
    });

    it('inserts array of data into speed collections', function (done) {
        var lambda = new ML.Lambda(config);

        lambda.reports([testReports.insertSpeedTest]);

        lambda.start(function() {
            lambda.insert([{ua: "specific2"}, {ua: "specific2"}], function(err, results) {
                mongo.speed[testReports.insertSpeedTest.name].find({ua: "specific2"}).toArray(function(err, doc) {
                    expect(err).to.not.exist();
                    expect(doc).to.exist();
                    expect(doc.length).to.equal(2);
                    done();
                })
            });
        })
    });

    it('can start without starting cron', function (done) {
        var lambda = new ML.Lambda(config);
        lambda.reports([testReports.startNoCronTest]);

        lambda.start(function() {
            setTimeout(function() {
                lambda.batches(testReports.startNoCronTest.name, function(err, batches) {
                    expect(batches.length).to.equal(0);
                    done();
                });
            }, 1500);
        });
    });

    it('data expires when ttl is set', function(done) {
      var ttlConfig = config;
      ttlConfig.ttl = 1;
      var lambda = new ML.Lambda(config);

      lambda.reports([testReports.ttlTest]);

      var startLambda = function(next) {
        lambda.start(function(){
          next();
        });
      };

      var insertData = function(next) {
       lambda.insert({ua: "iphone"}, function(err, results) {
         expect(err).to.not.exist();
         next(err);
       });
      };
      
      var checkResults = function(next) {
        setTimeout(function(){
          mongo.master.find({ua: "specific2"}).toArray(function(err, doc) {
            expect(err).to.not.exist();
            expect(doc.length).to.equal(0);
            next();
            done();
          });
        }, 1500);
      };

      Async.series([
          startLambda,
          insertData,
          checkResults
      ],
      function(err, results) {
        done();
      });

    });

    it('keeps correct total', { timeout: 60*1000 +1000}, function (done) {
        var lambda = new ML.Lambda(config);
        lambda.reports([testReports.totalTest]);

        lambda.start(function() {
            //Drip data
            var i = 0;
            setInterval(function() {
                lambda.insert({ua: "iphone"}, function(err, results) {
                    // console.log(' imp!');
                    // console.log('---------------------');

                    Async.parallel({
                        batches: Async.apply(lambda.batches, testReports.totalTest.name),
                        onTheFly: Async.apply(lambda.speedAgg, testReports.totalTest.name)
                    }, function(err, results){
                        i++;
                        // expect(err).to.not.exist();
                        var total = 0;
                        results.batches.forEach(function(batch) {
                            if (batch.data.length > 0) {
                                total = total + batch.data[0].count;
                            }

                        })
                        // console.log('batch layer: '+ total)

                        if(results.onTheFly.length > 0) {
                            // console.log('speed layer: '+ onTheFly[0].count)
                            total = total + results.onTheFly[0].count;
                        }

                        // console.log('---------------------');
                        // console.log('TOTAL COUNT: '+total)
                        // console.log('---------------------\n');
                        // console.log(new Date());
                        expect(total).to.equal(i);
                    });
                });
            }, 500);

            setTimeout(function() {
                done();
            }, 10*1000 + 500);

        })
    });


});
