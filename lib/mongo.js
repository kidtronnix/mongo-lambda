var Hoek = require('hoek');
var Batch = require('./batchLayer');
var MongoClient = require('mongodb').MongoClient
var internals = {};
var Async = require('async');

module.exports.init = function (options, next) {

  MongoClient.connect(options.url, function(err, db) {
    Hoek.assert(err === null, 'Error connecting to mongodb');
    module.exports.db = internals.db = db;
    module.exports.master = internals.master = db.collection(options.masterColl);
    module.exports.batches = {};
    module.exports.speed = {};
    Object.keys(Batch.reports).forEach(function(key) {
      var report = Batch.reports[key];
      var speedColl = report.name + '_delta';
      var batchesColl = report.name + '_batches';
      module.exports.batches[report.name] = db.collection(batchesColl);
      module.exports.speed[report.name] = db.collection(speedColl);
    });
    if(options.ttl) {
      var colls = Object.keys(Batch.reports);
      colls.push(options.masterColl);
      Async.each(colls, function(coll, callback) {
        if(coll != options.masterColl) { coll = coll+'_delta'; }
        internals.db.collection(coll).ensureIndex( { "_ts": 1 }, { expireAfterSeconds: options.ttl }, function(err, indexName) {
          Hoek.assert(err === null, 'Error ensuring _ts index');
          callback(err);
        });
      }, function(err) {
        next();
      });
      //console.log('- Ensuring ttl on '+options.masterColl);
    } else {
      next(err);
    }
  });
};
