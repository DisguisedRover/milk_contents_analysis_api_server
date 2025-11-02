const db = require('../models/db');
const unitSchema = require('../validators/unitsValidator');

exports.getUnits = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM units');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

exports.getUnitById = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM units WHERE unit_id = ?', 
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Unit not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

exports.createUnit = async (req, res) => {
  try {
    const { error } = unitSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const userId = req.user.id;
    const { unit_name, unit_symbol, unit_type, is_active } = req.body;

    const [result] = await db.query(
      `INSERT INTO units 
       (unit_name, unit_symbol, unit_type, is_active, created_by, updated_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [unit_name, unit_symbol, unit_type, is_active, userId, userId]
    );

    const [newUnit] = await db.query(
      'SELECT * FROM units WHERE unit_id = ?',
      [result.insertId]
    );

    res.status(201).json(newUnit[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

exports.updateUnit = async (req, res) => {
  try {
    const { error } = unitSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const userId = req.user.id;
    const { unit_name, unit_symbol, unit_type, is_active } = req.body;

    const [result] = await db.query(
      `UPDATE units SET 
       unit_name = ?, unit_symbol = ?, unit_type = ?, is_active = ?, updated_by = ?
       WHERE unit_id = ?`,
      [unit_name, unit_symbol, unit_type, is_active, userId, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Unit not found' });
    }

    res.json({ message: 'Unit updated successfully' });
  }
  catch (err){
    console.error(err);
    res.status(500).json({ error: 'Database Error' }); 
  }
};

exports.deleteUnit = async (req, res) => {
    try{}
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database Error'});
    }
};
