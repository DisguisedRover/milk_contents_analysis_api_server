const db = require('../models/db');
const reorderLevelSchema = require('../validators/reorderLevelsValidator');

exports.getReorderLevels = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM reorder_levels');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

exports.getReorderLevelById = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM reorder_levels WHERE reorder_id = ?', 
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Reorder level not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

exports.createReorderLevel = async (req, res) => {
  try {
    const { error } = reorderLevelSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const userId = req.user.id;
    const { product_id, warehouse_id, min_quantity, max_quantity, 
      reorder_quantity, reorder_point, lead_time_days, safety_stock, 
      is_active } = req.body;

    const [result] = await db.query(
      `INSERT INTO reorder_levels 
       (product_id, warehouse_id, min_quantity, max_quantity, reorder_quantity, 
        reorder_point, lead_time_days, safety_stock, is_active, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [product_id, warehouse_id, min_quantity, max_quantity, reorder_quantity, 
        reorder_point, lead_time_days, safety_stock, is_active, userId]
    );

    const [newReorderLevel] = await db.query(
      'SELECT * FROM reorder_levels WHERE reorder_id = ?',
      [result.insertId]
    );

    res.status(201).json(newReorderLevel[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

exports.updateReorderLevel = async (req, res) => {
  try {
    const { error } = reorderLevelSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const userId = req.user.id;
    const { product_id, warehouse_id, min_quantity, max_quantity, 
      reorder_quantity, reorder_point, lead_time_days, safety_stock, 
      is_active } = req.body;

    const [result] = await db.query(
      `UPDATE reorder_levels SET 
       product_id = ?, warehouse_id = ?, min_quantity = ?, max_quantity = ?, 
       reorder_quantity = ?, reorder_point = ?, lead_time_days = ?, 
       safety_stock = ?, is_active = ?, updated_by = ?
       WHERE reorder_id = ?`,
      [product_id, warehouse_id, min_quantity, max_quantity, reorder_quantity, 
        reorder_point, lead_time_days, safety_stock, is_active, userId, 
        req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Reorder level not found' });
    }

    res.json({ message: 'Reorder level updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

exports.deleteReorderLevel = async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM reorder_levels WHERE reorder_id = ?', 
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Reorder level not found' });
    }
    res.json({ message: 'Reorder level deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};
