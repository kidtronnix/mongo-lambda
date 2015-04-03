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
    agg: Joi.array().required(),
    cron: Joi.string().required(),
    timezone: Joi.string().required(),
    startCron: Joi.bool().default(true)
});

internals.reports = Joi.array().includes(internals.report).min(1);

internals.config = Joi.object({
    host: Joi.string().required(),
    port: Joi.number().integer().required(),
    db: Joi.string().required(),
    masterColl: Joi.string().required()
});
