const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const productSchema  = require('../validators/productValidator');
const validate = require('../middlewares/validate');

router.get('/getAllProduct', productController.getProduct);
router.get('/getProductById/:id', productController.getProductById);
router.post('/saveProduct', validate(productSchema),productController.saveProduct);
router.put('/editProduct/:id', validate(productSchema),productController.editProduct);
router.delete('/deleteProduct/:id', productController.deleteProduct);

module.exports = router;