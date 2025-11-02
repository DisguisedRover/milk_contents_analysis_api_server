const deliveryNoteSchema = Joi.object({
  delivery_number: Joi.string().max(50).required(),
  so_id: Joi.number().integer().required(),
  customer_id: Joi.number().integer().allow(null),
  warehouse_id: Joi.number().integer().required(),
  delivery_date: Joi.date().required(),
  delivery_address: Joi.string().allow(null, ''),
  vehicle_number: Joi.string().max(20).allow(null, ''),
  driver_name: Joi.string().max(50).allow(null, ''),
  driver_contact: Joi.string().max(20).allow(null, ''),
  status: Joi.string().valid('PENDING', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED').default('PENDING'),
  notes: Joi.string().allow(null, ''),
  received_by_customer: Joi.string().max(100).allow(null, ''),
  signature_path: Joi.string().max(255).allow(null, '')
});

module.exports = deliveryNoteSchema;
