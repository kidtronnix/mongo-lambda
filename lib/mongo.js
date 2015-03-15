var Batch = require('./batchLayer');
var mongodb = require('mongodb');

module.exports.init = function (options, next) {
    var server = new mongodb.Server(options.host, options.port, {});
    new mongodb.Db(options.db, server, {w: 1}).open(function (error, client) {
        //export the client and some collections as a shortcut
        module.exports.db = client;
        module.exports.master = new mongodb.Collection(client, options.masterColl);
       	module.exports.batches = {};
       	module.exports.speed = {};
        Object.keys(Batch.reports).forEach(function(key) {
		  	var report = Batch.reports[key];
		  	var speedColl = report.name + '_delta';
        	var batchesColl = report.name + '_batches';
        	module.exports.batches[report.name] = new mongodb.Collection(client, batchesColl);
        	module.exports.speed[report.name] = new mongodb.Collection(client, speedColl);
		});

        next(error);
    });
};
