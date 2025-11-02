const productBatchSchema = Joi.object({
  product_id: Joi.number().integer().required(),
  batch_number: Joi.string().max(50).required(),
  warehouse_id: Joi.number().integer().required(),
  supplier_id: Joi.number().integer().allow(null),
  purchase_order_id: Joi.number().integer().allow(null),
  manufacture_date: Joi.date().allow(null),
  expiry_date: Joi.date().allow(null),
  initial_quantity: Joi.number().precision(2).required(),
  current_quantity: Joi.number().precision(2).required(),
  cost_price: Joi.number().precision(2).allow(null),
  mrp: Joi.number().precision(2).allow(null),
  notes: Joi.string().allow(null, ''),
  is_active: Joi.boolean().default(true)
});

module.exports = productBatchSchema;
