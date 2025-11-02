const express = require('express');
const router = express.Router();
const { authenticate } = require('../controllers/authController');
const stockTransferController = require('../controllers/stockTransferController');
const stockTransferSchema = require('../validators/stock/stockTransfersValidator');
const validate = require('../middlewares/validate');

router.get('/getAllStockTransfers', authenticate, stockTransferController.getStockTransfers);
router.get('/getStockTransferById/:id', authenticate, stockTransferController.getStockTransferById);
router.post('/saveStockTransfer', authenticate, validate(stockTransferSchema), stockTransferController.createStockTransfer);
router.put('/editStockTransfer/:id', authenticate, validate(stockTransferSchema), stockTransferController.updateStockTransfer);
router.delete('/deleteStockTransfer/:id', authenticate, stockTransferController.deleteStockTransfer);

module.exports = router;
