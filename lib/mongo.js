var mongodb = require('mongodb');

module.exports.init = function (options, callback) {
    var server = new mongodb.Server("127.0.0.1", 27017, {});
    new mongodb.Db('lambda-db', server, {w: 1}).open(function (error, client) {
        //export the client and maybe some collections as a shortcut
        module.exports.db = client;
        module.exports.batchMaster = new mongodb.Collection(client, 'master');
        module.exports.speedDelta = new mongodb.Collection(client, '_delta');
        module.exports.reports = new mongodb.Collection(client, '_reports');
        callback(error);
    });
};
