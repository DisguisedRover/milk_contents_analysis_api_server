const express = require('express');
const router = express.Router();
const { authenticate } =require('../controllers/authController');
const systemSettingsController = require('../controllers/systemSettingsController');
const systemSettingsSchema = require('../validators/reorderLevelsValidator');
const validate = require('../middlewares/validate');

router.get('/getAllSystemSettings', authenticate, systemSettingsController.getSystemSettings);
router.get('/getSystemSettingsById/:id', authenticate, systemSettingsController.getSystemSettingById);
router.get('/getSystemSettingsByKey/:key', authenticate, systemSettingsController.getSystemSettingByKey);
router.post('/saveSystemSettings', authenticate, validate(systemSettingsSchema), systemSettingsController.createSystemSetting);
router.put('/editSystemSettings/:id', authenticate, validate(systemSettingsSchema), systemSettingsController.updateSystemSetting);
router.delete('/deleteSystemSettings/:id', authenticate, systemSettingsController.deleteSystemSetting);

module.exports = router;