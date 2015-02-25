// Load modules
var Joi = require('joi');
var Hoek = require('hoek');
// Declare internals
var internals = {};

exports.assert = function (type, options, message) {
    var result = Joi.validate(options, internals[type]);
    Hoek.assert(!result.error, 'Invalid', type, 'options', message ? '(' + message + ')' : '', result.error && result.error.annotate());
    return result.value;
};

internals.reports = Joi.object({
    name: Joi.string().invalid('_default'),
    agg: Joi.object(),
    frquency: Joi.int()
});

// TO DO ADD SCHEMA FOR ALL OBJECTS IN config.js
