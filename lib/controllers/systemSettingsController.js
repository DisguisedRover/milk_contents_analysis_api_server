const db = require('../models/db');
const systemSettingSchema = require('../validators/systemSettingsValidator');

exports.getSystemSettings = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM system_settings');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

exports.getSystemSettingById = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM system_settings WHERE setting_id = ?', 
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'System setting not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

exports.getSystemSettingByKey = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM system_settings WHERE setting_key = ?', 
      [req.params.key]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'System setting not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

exports.createSystemSetting = async (req, res) => {
  try {
    const { error } = systemSettingSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const userId = req.user.id;
    const { setting_key, setting_value, data_type, category, description, 
      is_editable } = req.body;

    const [result] = await db.query(
      `INSERT INTO system_settings 
       (setting_key, setting_value, data_type, category, description, 
        is_editable, updated_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [setting_key, setting_value, data_type, category, description, 
        is_editable, userId]
    );

    const [newSetting] = await db.query(
      'SELECT * FROM system_settings WHERE setting_id = ?',
      [result.insertId]
    );

    res.status(201).json(newSetting[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

exports.updateSystemSetting = async (req, res) => {
  try {
    const { error } = systemSettingSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const userId = req.user.id;
    const { setting_key, setting_value, data_type, category, description, 
      is_editable } = req.body;

    // Check if setting is editable
    const [existing] = await db.query(
      'SELECT is_editable FROM system_settings WHERE setting_id = ?',
      [req.params.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'System setting not found' });
    }

    if (!existing[0].is_editable) {
      return res.status(403).json({ error: 'This setting is not editable' });
    }

    const [result] = await db.query(
      `UPDATE system_settings SET 
       setting_key = ?, setting_value = ?, data_type = ?, category = ?, 
       description = ?, is_editable = ?, updated_by = ?
       WHERE setting_id = ?`,
      [setting_key, setting_value, data_type, category, description, 
        is_editable, userId, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'System setting not found' });
    }

    res.json({ message: 'System setting updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

exports.deleteSystemSetting = async (req, res) => {
  try {
    // Check if setting is editable before deletion
    const [existing] = await db.query(
      'SELECT is_editable FROM system_settings WHERE setting_id = ?',
      [req.params.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'System setting not found' });
    }

    if (!existing[0].is_editable) {
      return res.status(403).json({ error: 'This setting cannot be deleted' });
    }

    const [result] = await db.query(
      'DELETE FROM system_settings WHERE setting_id = ?', 
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'System setting not found' });
    }

    res.json({ message: 'System setting deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};
