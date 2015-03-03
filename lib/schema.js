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

internals.report = Joi.object({
    name: Joi.string().required(),
    agg: Joi.object().required(),
    cron: Joi.string().required(),
    timezone: Joi.string().required()
});

internals.batchLayer = Joi.object({
    collection: Joi.string().required(),
    dataRetention: Joi.number().integer().required()
});

internals.speedLayer = Joi.object({
    collection: Joi.string().required()
});

internals.servingLayer = Joi.object({
    combine: Joi.func().required()
});

internals.options = Joi.object({
    batchLayer: internals.batchLayer.required(),
    speedLayer: internals.speedLayer.required(),
    servingLayer: internals.servingLayer.required()
})
