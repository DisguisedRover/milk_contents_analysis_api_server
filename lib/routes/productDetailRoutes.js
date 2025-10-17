const express = require('express');
const router = express.Router();
const { authenticate } = require('../controllers/authController');
const {
  getAllProductDetail,
  getProductDetailById,
  saveProductDetail,
  updateProductDetail,
  deleteProductDetail
} = require('../controllers/productDetailController');
const productDetailSchema = require('../validators/productDetailValidator');
const validate = require('../middlewares/validate');

router.get('/getAllProductDetail',authenticate, getAllProductDetail);

router.get('/getProductDetailById/:id',authenticate, getProductDetailById);

router.post('/saveProductDetail', authenticate, validate(productDetailSchema), saveProductDetail);

router.put('/editProductDetail/:id', authenticate, validate(productDetailSchema), updateProductDetail);

router.delete('/deleteProductDetail/:id', authenticate, deleteProductDetail);

module.exports = router;