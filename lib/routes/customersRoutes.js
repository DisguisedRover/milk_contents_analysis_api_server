const express = require('express');
const router = express.Router();
const { authenticate } =require('../controllers/authController');
const customerController = require('../controllers/customersController');
const customerSchema = require('../validators/customer/customersValidator');
const validate = require('../middlewares/validate');

router.get('/getAllCustomers', authenticate, customerController.getCustomers);
router.get('/getCustomerById/:id', authenticate, customerController.getCustomerById);
router.post('/saveCustomer', authenticate, validate(customerSchema), customerController.createCustomer);
router.put('/editCustomer/:id', authenticate, validate(customerSchema), customerController.updateCustomer);
router.delete('/deleteCustomer/:id', authenticate, customerController.deleteCustomer);

module.exports = router;