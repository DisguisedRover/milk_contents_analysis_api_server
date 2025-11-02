const express = require('express');
const router = express.Router();
const { authenticate } = require('../controllers/authController');
const stockLevelController = require('../controllers/stockLevelsController');
const stockLevelSchema = require('../validators/stock/stockLevelsValidator');
const validate = require('../middlewares/validate');

router.get('/getAllStockLevels', authenticate, stockLevelController.getStockLevels);
router.get('/getStockLevelById/:id', authenticate, stockLevelController.getStockLevelById);
router.post('/saveStockLevel', authenticate, validate(stockLevelSchema), stockLevelController.createStockLevel);
router.put('/editStockLevel/:id', authenticate, validate(stockLevelSchema), stockLevelController.updateStockLevel);
router.delete('/deleteStocklevel/:id', authenticate, stockLevelController.deleteStockLevel);

module.exports = router;