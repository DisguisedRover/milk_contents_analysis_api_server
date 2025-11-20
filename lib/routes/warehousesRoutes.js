const express = require('express');
const router = express.Router();
const { authenticate } = require('../controllers/authController');
const warehousesController = require('../controllers/warehousesController');
const warehousesSchema = require('../validators/warehousesValidator');
const validate = require('../middlewares/validate');

router.get('/getAllWarehouses', authenticate, warehousesController.getWarehouses);
router.get('getWarehousesByID/:id', authenticate, warehousesController.getWarehouseById);
router.post('saveWarehouses', authenticate, validate(warehousesSchema), warehousesController.saveWarehouses);
router.put('editWarehouses/:id', authenticate, validate(warehousesSchema), warehousesController.editWarehouses);
router.delete('deleteWarehouses/:id', authenticate, warehousesController.deleteWarehouses);

module.exports = router;
