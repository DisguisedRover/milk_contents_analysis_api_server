const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { signupSchema, loginSchema, editUserNameSchema } = require('../validators/authValidator');
const validate = require('../middlewares/validate');

router.post('/signup', validate(signupSchema), authController.signup);
router.post('/login', validate(loginSchema), authController.login);
router.get('/checkExistingUser', authController.checkExistingUser);
router.put('/editUserName', authController.authenticate, validate(editUserNameSchema), authController.editUserName);

module.exports = router;