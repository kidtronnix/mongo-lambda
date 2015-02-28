exports.insertData = function(data, next){

    setTimeout(function(){
        console.log('Speed inserted!');
        console.log(data)
        next(null, 5);
    }, 100);
}

exports.scrubData = function(data, next){

    setTimeout(function(){
        console.log('Speed inserted!');
        console.log(data)
        next(null, 5);
    }, 100);
}

exports.runAgg = function(data, next){

    setTimeout(function(){
        console.log('Speed inserted!');
        console.log(data)
        next(null, 5);
    }, 100);
}
