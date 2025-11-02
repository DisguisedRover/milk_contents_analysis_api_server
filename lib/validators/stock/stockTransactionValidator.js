const Joi = require('joi');

const stockTransactionSchema = Joi.object({
  product_id: Joi.number().integer().required(),
  warehouse_id: Joi.number().integer().required(),
  transaction_type: Joi.string().valid('IN', 'OUT', 'ADJUST', 'TRANSFER').required(),
  quantity: Joi.number().precision(2).required(),
  reference_id: Joi.number().integer().allow(null),
  reference_type: Joi.string().valid('PURCHASE', 'SALE', 'TRANSFER', 'ADJUSTMENT').allow(null),
  notes: Joi.string().allow(null, ''),
});

module.exports = stockTransactionSchema;