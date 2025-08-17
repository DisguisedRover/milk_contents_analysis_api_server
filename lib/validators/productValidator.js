const Joi = require('joi');

const productSchema = Joi.object({
  productName: Joi.string().max(50).required(),
  type: Joi.string().max(30).required(),
  category: Joi.string().max(30).required(),
  subCategory: Joi.string().max(30).allow(null, ''),
  isTaxable: Joi.string().valid('Yes', 'No').required(),
  isKeepingStock: Joi.string().valid('Yes', 'No').required(),
  savedBy: Joi.string().max(30).required(),
  savedIn: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(), // YYYY-MM-DD as string
  status: Joi.string().max(30).required()
});

module.exports = productSchema;