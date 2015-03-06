var mongo = require('./mongo');

exports.insertData = function(data, next){
    mongo.speedDelta.insert(data, {safe:true}, function(err, objects) {
        if (err) {
            console.warn(err.message);
        }
        next(err);
    });
}

exports.scrubData = function(data, next){

    setTimeout(function(){
        console.log('Speed scrubbed!');
        console.log(data)
        next(null, 5);
    }, 100);
}

exports.getView = function(data, next){

    setTimeout(function(){
        console.log('Speed inserted!');
        console.log(data)
        next(null, 5);
    }, 100);
}
