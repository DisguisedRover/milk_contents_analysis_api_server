const express = require('express');
const router = express.Router();
const { authenticate } =require('../controllers/authController');
const reorderLevelsController = require('../controllers/reorderLevelsController');
const reorderLevelsSchema = require('../validators/reorderLevelsValidator');
const validate = require('../middlewares/validate');

router.get('/getAllReorderLevels', authenticate, reorderLevelsController.getReorderLevels);
router.get('/getReorderLevelsById/:id', authenticate, reorderLevelsController.getReorderLevelById);
router.post('/saveReorderLevels', authenticate, validate(reorderLevelsSchema), reorderLevelsController.createReorderLevel);
router.put('/editReorderLevels/:id', authenticate, validate(reorderLevelsSchema), reorderLevelsController.updateReorderLevel);
router.delete('/deleteReorderLevels/:id', authenticate, reorderLevelsController.deleteReorderLevel);

module.exports = router;