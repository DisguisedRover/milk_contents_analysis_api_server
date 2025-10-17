const Joi = require('joi');

const productSchema = Joi.object({
  product_name: Joi.string().max(50).required(),
  type: Joi.string().max(30).required(),
  category: Joi.string().max(30).required(),
  subCategory: Joi.string().max(30).optional().allow(''),
  isTaxable: Joi.string().valid('Yes', 'No').required(),
  isKeepingStock: Joi.string().valid('Yes', 'No').required(),
  savedIn: Joi.date().iso().required(),
  status: Joi.string().max(30).required(),
  category_id: Joi.number().integer().optional()
});

module.exports = productSchema;
