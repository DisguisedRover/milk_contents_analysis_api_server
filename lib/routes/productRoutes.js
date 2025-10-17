const express = require('express');
const router = express.Router();
const { authenticate } = require('../controllers/authController');
const productController = require('../controllers/productController');
const productSchema  = require('../validators/productValidator');
const validate = require('../middlewares/validate');

router.get('/getAllProduct', authenticate, productController.getProduct);
router.get('/getProductById/:id',authenticate, productController.getProductById);
router.post('/saveProduct', authenticate, validate(productSchema),productController.saveProduct);
router.put('/editProduct/:id', authenticate, validate(productSchema),productController.editProduct);
router.delete('/deleteProduct/:id', authenticate, productController.deleteProduct);

module.exports = router;