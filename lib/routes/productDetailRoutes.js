const express = require('express');
const router = express.Router();
const productDetailController = require('../controllers/productDetailController');
const productDetailSchema  = require('../validators/productDetailValidator');
const validate = require('../middlewares/validate');


router.get('/getAllProductDetail', productDetailController.getAllProductDetail);
router.get('/getProductDetailById/:id', productDetailController.getProductDetailById);
router.post('/saveProductDetail',validate(productDetailSchema), productDetailController.saveProductDetail);
router.put('/editProductDetail/:id',validate(productDetailSchema),  productDetailController.updateProductDetail);
router.delete('/deleteProductDetail/:id', productDetailController.deleteProductDetail);

module.exports = router;
