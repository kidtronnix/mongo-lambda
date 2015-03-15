var ML = require('..');

var lambda = new ML.Lambda({
	host: 'localhost',
    port: 27017,
    db: 'lambda-db',
    masterColl: "master"
});



lambda.start(function() {
})
