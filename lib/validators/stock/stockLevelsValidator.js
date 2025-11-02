const Joi = require('joi');

const stockLevelsSchema = Joi.object({
    product_id: Joi.number().integer().required(),
    warehouse_id: Joi.number().integer().required(),
    minimum_level: Joi.number().precision(2).required(),
    maximum_level: Joi.number().precision(2).required(),
});

module.exports = stockLevelsSchema;