var Batch = require('./batchLayer');
var mongodb = require('mongodb');

module.exports.init = function (options, next) {
    var server = new mongodb.Server("127.0.0.1", 27017, {});
    new mongodb.Db('lambda-db', server, {w: 1}).open(function (error, client) {
        //export the client and maybe some collections as a shortcut
        module.exports.db = client;
        module.exports.master = new mongodb.Collection(client, options.masterCollection);

       	module.exports.batches = {};
       	module.exports.speed = {};

        Object.keys(Batch.reports).forEach(function(key) {
		  	var report = Batch.reports[key];
		  	var speedColl = report.name + '_delta';
        	var batchesColl = report.name + '_batches';
        	module.exports.batches[report.name] = new mongodb.Collection(client, batchesColl);
        	module.exports.speed[report.name] = new mongodb.Collection(client, speedColl);
		});
        // .forEach(function(report){

        // });

        next(error);
    });
};
