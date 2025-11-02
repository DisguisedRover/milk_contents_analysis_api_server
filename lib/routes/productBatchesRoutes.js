const express = require('express');
const router = express.Router();
const { authenticate } =require('../controllers/authController');
const productBatchesController = require('../controllers/productBatchesController');
const productBatchesSchema = require('../validators/product/productBatchesValidator');
const validate = require('../middlewares/validate');

router.get('/getAllProductBatches', authenticate, productBatchesController.getProductBatches);
router.get('/getProductBatchesById/:id', authenticate, productBatchesController.getProductBatchById);
router.post('/saveProductBatches', authenticate, validate(productBatchesSchema), productBatchesController.createProductBatch);
router.put('/editProductBatches/:id', authenticate, validate(productBatchesSchema), productBatchesController.updateProductBatch);
router.delete('/deleteProductBatches/:id', authenticate, productBatchesController.deleteProductBatch);

module.exports = router;