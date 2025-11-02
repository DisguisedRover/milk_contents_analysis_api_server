const stockAlertSchema = Joi.object({
  product_id: Joi.number().integer().required(),
  warehouse_id: Joi.number().integer().required(),
  alert_type: Joi.string().valid('LOW_STOCK', 'OUT_OF_STOCK', 'EXPIRY', 'OVERSTOCK', 'REORDER').required(),
  current_quantity: Joi.number().precision(2).allow(null),
  threshold_quantity: Joi.number().precision(2).allow(null),
  alert_message: Joi.string().allow(null, ''),
  priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'CRITICAL').default('MEDIUM'),
  resolution_notes: Joi.string().allow(null, '')
});

module.exports = stockAlertSchema;