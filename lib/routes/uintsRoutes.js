const express = require('express');
const router = express.Router();
const { authenticate } = require('../controllers/authController');
const untisController = require('../controllers/unitsController');
const unitSchema = require('../validators/unitsValidator');
const validate = require('../middlewares/validate');

router.get('/getAllUnits', authenticate, untisController.getUnits);
router.get('/getUnitById/:id', authenticate, untisController.getUnitById);
router.post('/saveUnits', authenticate, validate(unitSchema), untisController.createUnit);
router.put('/editUnit/:id', authenticate, validate(unitSchema), untisController.updateUnit);
router.delete('/deleteUnit/:id', authenticate,untisController.deleteUnit);

module.exports = router;