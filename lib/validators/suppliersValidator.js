const Joi = require('joi');

const suppliersSchema = Joi.object({
    name: Joi.string().max(100).required(),
    contact_person: Joi.string().max(50).required(),
    email: Joi.string().max(100).email(),
    phone: Joi.string().max(20).required(),
    address: Joi.string().max(200),
    tax_id: Joi.string().max(50).required(),
    payment_terms: Joi.string().max(50),
    is_active: Joi.boolean().required(),
});

module.exports = suppliersSchema;