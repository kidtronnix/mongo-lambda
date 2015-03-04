
var Hoek = require('hoek');
var mongo = require('./mongo');

var internals = {};

exports.insertData = function(data, next) {
    mongo.myCollection.insert({test: 'obj'}, {safe:true}, function(err, objects) {
    if (err) {
        console.warn(err.message);
    }
    next(err);
    });
}

exports.scrubData = function(data, next) {

    setTimeout(function(){
        console.log('Batch data scrubbed!');
        console.log(data);
        next(null, data);
    }, 200);



}

exports.insertReport = function(data, next) {
    setTimeout(function(){
        console.log('Batch report inserted!');
        console.log(data);
        next(null, data);
    }, 200);

}

exports.updateReport = function(data, next) {
    setTimeout(function(){
        console.log('Batch report updated!');
        console.log(data);
        next(null, 1);
    }, 200);
}

exports.runReport = function(name, next) {
    setTimeout(function(){
        console.log('Batch report ran!');
        console.log(name);
        next(null, 1);
    }, 200);
}
