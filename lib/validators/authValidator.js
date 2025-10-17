const Joi = require('joi');

const signupSchema = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password_hash: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref('password_hash')).required()
        .messages({ 'any.only': 'Passwords do not match' }),
    role: Joi.string().valid('admin', 'user').default('user')
});

const loginSchema = Joi.object({
    identifier: Joi.string().required(),
    password: Joi.string().required()
});

const editUserNameSchema = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    password: Joi.string().min(6).required()
});

module.exports = { signupSchema, loginSchema, editUserNameSchema };