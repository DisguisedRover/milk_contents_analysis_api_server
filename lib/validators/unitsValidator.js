const Joi = require('joi');

const unitSchema = Joi.object({
  unit_name: Joi.string().max(30).required(),
  unit_symbol: Joi.string().max(10).required(),
  unit_type: Joi.string().valid('BASE', 'DERIVED').required(),
  is_active: Joi.boolean().default(true)
});

module.exports = unitSchema;
