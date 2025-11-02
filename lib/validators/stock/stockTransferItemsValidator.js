const stockTransferItemSchema = Joi.object({
  transfer_id: Joi.number().integer().required(),
  product_id: Joi.number().integer().required(),
  batch_id: Joi.number().integer().allow(null),
  requested_quantity: Joi.number().precision(2).required(),
  unit_cost: Joi.number().precision(2).allow(null),
  notes: Joi.string().allow(null, '')
});

module.exports = stockTransferItemSchema;
