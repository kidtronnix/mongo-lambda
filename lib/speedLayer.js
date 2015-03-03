console.log(this);

exports.insertData = function(data, next){

    setTimeout(function(){
        console.log('Speed inserted!');
        console.log(data)
        next(null, 5);
    }, 100);
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
