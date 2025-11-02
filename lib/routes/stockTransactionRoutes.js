const express =  require('express');
const router = express.Router();
const { authenticate } = require('../controllers/authController');
const soctockTransactionController = require('../controllers/stockTransactionController');
const stockTransactionSchema = require('../validators/stock/stockTransactionValidator');
const vaildate = require('../middlewares/validate');

router.get('/getAllstockTransactions', authenticate, soctockTransactionController.getStockTransactions);
router.get('/getStockTransactionById/:id', authenticate, soctockTransactionController.getStockTransactionById);
router.post('/saveStockTransaction', authenticate, vaildate(stockTransactionSchema), soctockTransactionController.createStockTransaction);
router.put('/editStockTransaction/:id', authenticate, vaildate(stockTransactionSchema), soctockTransactionController.editStockTransaction);
router.delete('/deleteStockTransaction/:id', authenticate, soctockTransactionController.deleteStockTransaction);

module.exports = router;