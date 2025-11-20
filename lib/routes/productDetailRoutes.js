const express = require('express');
const router = express.Router();
const { authenticate } = require('../controllers/authController');
const productDetailsController = require('../controllers/productDetailController');
const productDetailSchema = require('../validators/product/productDetailValidator');
const validate = require('../middlewares/validate');

router.get('/getAllProductDetail',authenticate, productDetailsController.getAllProductDetail);
router.get('/getProductDetailByProductId/:productId',authenticate, productDetailsController.getProductDetailByProductId);
router.get('/getProductDetailById/:id',authenticate, productDetailsController.getProductDetailById);
router.post('/saveProductDetail', authenticate, validate(productDetailSchema), productDetailsController.saveProductDetail);
router.put('/editProductDetail/:id', authenticate, validate(productDetailSchema), productDetailsController.updateProductDetail);
router.delete('/deleteProductDetail/:id', authenticate, productDetailsController.deleteProductDetail);

module.exports = router;