const Joi = require('joi');

const productDetailSchema = Joi.object({
  productName: Joi.string().max(50).required(),
  baseUnit: Joi.string().max(30).required(),
  derivedUnit: Joi.string().max(30).allow(null, ''),
  deriveFormula: Joi.string().max(100).allow(null, ''),
  dimension: Joi.string().max(50).required(),
  salesRate: Joi.number().precision(2).required(),
  fatRate: Joi.number().precision(2).required(),
  rateAffectsDate: Joi.date().required(),
  openingStock: Joi.number().precision(2).required(),
  stockDate: Joi.date().required(),
  savedBy: Joi.string().max(30).required(),
  savedIn: Joi.string().max(30).required(),
  flavour: Joi.string().max(30).allow(null, '')
});

module.exports = productDetailSchema;
