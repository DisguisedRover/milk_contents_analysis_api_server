const purchaseReceiptItemSchema = Joi.object({
  receipt_id: Joi.number().integer().required(),
  po_item_id: Joi.number().integer().required(),
  product_id: Joi.number().integer().required(),
  batch_id: Joi.number().integer().allow(null),
  ordered_quantity: Joi.number().precision(2).required(),
  received_quantity: Joi.number().precision(2).required(),
  accepted_quantity: Joi.number().precision(2).required(),
  rejected_quantity: Joi.number().precision(2).default(0),
  unit_price: Joi.number().precision(2).required(),
  line_total: Joi.number().precision(2).required(),
  notes: Joi.string().allow(null, '')
});

module.exports = purchaseReceiptItemSchema;
