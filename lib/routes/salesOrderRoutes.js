const express = require('express');
const router = express.Router();
const { authenticate } = require('../controllers/authController');
const salesOrdercontroller = require('../controllers/salesOrderController');
const salesOrderSchema = require('../validators/sales/salesOrdersValidator');
const validate = require('../middlewares/validate');

router.get('/getAllSalesOrders', authenticate, salesOrdercontroller.getSalesOrders);
router.get('/getSalesOrderById/:id', authenticate, salesOrdercontroller.getSalesOrderById);
router.post('/saveSalesOrder', authenticate, validate(salesOrderSchema), salesOrdercontroller.createSalesOrder);
router.put('/editSalesOrder/:id', authenticate, validate(salesOrderSchema), salesOrdercontroller.updateSalesOrder);
router.delete('/deleteSalesOrder/:id', authenticate, salesOrdercontroller.deleteSalesOrder);

module.exports = router;
