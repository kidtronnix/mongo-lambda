var Hoek = require('hoek');
var Batch = require('./batchLayer');
var MongoClient = require('mongodb').MongoClient
var internals = {};

module.exports.init = function (options, next) {

  MongoClient.connect(options.url, function(err, db) {
    Hoek.assert(err === null, 'Error connecting to mongodb');
    module.exports.db = db;
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
      internals.master.ensureIndex( { "_ts": 1 }, { expireAfterSeconds: options.ttl }, function(err, indexName) {
        Hoek.assert(err === null, 'Error ensuring _ts index');
        next(err);
      });
    } else {
      next(err);
    }
  });
};
