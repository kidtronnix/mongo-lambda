var internals = {};

exports.insertData = function(data, next) {

    setTimeout(function(){
        console.log('Batch data inserted!');
        console.log(data);
        next(null, 1);
    }, 200);
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

exports.getReportData = function(name, next) {

}
