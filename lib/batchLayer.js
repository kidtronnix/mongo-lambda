var internals = {};

exports.insertData = function(data, next) {

    setTimeout(function(){
        console.log('Batch inserted!');
        console.log(data);
        next(null, 1);
    }, 200);
}

exports.scrubData = function(data, next) {

}


exports.getReports = function(data, next) {

}

exports.runAgg = function(data, next) {

}

exports.insertReport = function(data, next) {

}

exports.updateReport = function(data, next) {

}
