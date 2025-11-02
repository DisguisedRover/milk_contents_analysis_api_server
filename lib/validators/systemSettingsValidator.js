const Joi = require('joi');

const systemSettingSchema = Joi.object({
  setting_key: Joi.string().max(50).required(),
  setting_value: Joi.string().allow(null, ''),
  data_type: Joi.string().valid('STRING', 'NUMBER', 'BOOLEAN', 'JSON', 'DATE').default('STRING'),
  category: Joi.string().max(50).allow(null, ''),
  description: Joi.string().allow(null, ''),
  is_editable: Joi.boolean().default(true)
});

module.exports = systemSettingSchema;