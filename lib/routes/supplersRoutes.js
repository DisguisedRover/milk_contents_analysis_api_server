const express = require('express');
const router = express.Router();
const { authenticate } = require('../controllers/authController');
const suppliersController = require('../controllers/suppliersController');
const suppliersSchema  = require('../validators/suppliersValidator'); 
const validate = require('../middlewares/validate');

router.get('/getAllSuppliers', authenticate, suppliersController.getSuppliers);
router.get('/getSuppliersById/:id', authenticate, suppliersController.getSuppliersById);
router.post('/saveSuppliers', authenticate, validate(suppliersSchema), suppliersController.saveSuppliers); 
router.put('/editSuppliers/:id', authenticate, validate(suppliersSchema), suppliersController.editSuppliers);
router.delete('/deleteSuppliers/:id', authenticate, suppliersController.deleteSuppliers);

module.exports = router;