const poItemSchema = Joi.object({
  po_id: Joi.number().integer().required(),
  product_id: Joi.number().integer().required(),
  warehouse_id: Joi.number().integer().allow(null),
  quantity: Joi.number().precision(2).required(),
  unit_price: Joi.number().precision(2).required(),
  tax_rate: Joi.number().precision(2).default(0),
  discount_amount: Joi.number().precision(2).default(0),
  line_total: Joi.number().precision(2).required()
});

module.exports = poItemSchema;
