const Joi = require('joi');

const warehousesSchema = Joi.object({
    name: Joi.string().max(100).required(),
    location: Joi.string().max(255).required(),
    manager_id: Joi.number().integer(),
    capacity: Joi.number().integer().required(),
    is_active: Joi.boolean().required(),
});

module.exports = warehousesSchema;