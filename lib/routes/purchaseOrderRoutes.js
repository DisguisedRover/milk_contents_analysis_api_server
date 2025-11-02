const express = require('express');
const router = express.Router();
const { authenticate } =require('../controllers/authController');
const purchaseOrderSchema = require('../validators/purchase/purchaseOrdersValidator');
const purchaseOrderController = require('../controllers/purchaseOrderController');
const validate = require('../middlewares/validate');

router.get('/getAllPurchaseOrders', authenticate, purchaseOrderController.getPurchaseOrders);
router.get('/getPurchaseOrderById/:id', authenticate, purchaseOrderController.getPurchaseOrderById);
router.post('/savePurchaseOrder', authenticate, validate(purchaseOrderSchema), purchaseOrderController.createPurchaseOrder);
router.put('/editPurchaseOrder/:id', authenticate, validate(purchaseOrderSchema), purchaseOrderController.updatePurchaseOrder);
router.delete('/deletePurchaseOrder/:id', authenticate, purchaseOrderController.deletePurchaseOrder);

module.exports = router;