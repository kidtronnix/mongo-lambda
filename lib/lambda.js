// Contructor Function
var internals = {};

exports = module.exports = internals.Lambda = function (options) {

    Hoek.assert(this.constructor === internals.Lambda, 'Lambda must be instantiated using new');
    options = Schema.assert('server', options || {});
}
