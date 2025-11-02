const express = require('express');
const router = express.Router();
const { authenticate } = require('../controllers/authController'); 
const categoriesController = require('../controllers/categoriesController');
const categoriesSchema = require('../validators/product/categoriesValidator');
const validate = require('../middlewares/validate');

router.get('/getAllCategories', authenticate, categoriesController.getCategories);
router.get('/getCategoriesById/:id', authenticate, categoriesController.getCategoryById);
router.post('/saveCategories', authenticate, validate(categoriesSchema), categoriesController.createCategory);
router.put('/editCategories/:id', authenticate, validate(categoriesSchema), categoriesController.updateCategory);
router.delete('/deleteCategories/:id', authenticate, categoriesController.deleteCategory);

module.exports = router;