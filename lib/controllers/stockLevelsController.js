const db = require('../models/db');
const stockLevelsSchema = require('../validators/stock/stockLevelsValidator');

exports.getStockLevels = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM stock_levels');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

exports.getStockLevelById = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM stock_levels WHERE stock_id = ?', 
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Stock level not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

exports.createStockLevel = async (req, res) => {
  try {
    const { error } = stockLevelsSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const userId = req.user.id;
    const { product_id, warehouse_id, min_stock_level, max_stock_level } = req.body;

    const [result] = await db.query(
      `INSERT INTO stock_levels 
       (product_id, warehouse_id, quantity, min_stock_level, max_stock_level, created_by)
       VALUES (?, ?, 0, ?, ?, ?)`,
      [product_id, warehouse_id, min_stock_level, max_stock_level, userId]
    );

    const [newStockLevel] = await db.query(
      'SELECT * FROM stock_levels WHERE stock_id = ?',
      [result.insertId]
    );

    res.status(201).json(newStockLevel[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

exports.updateStockLevel = async (req, res) => {
  try {
    const { error } = stockLevelsSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { product_id, warehouse_id, min_stock_level, max_stock_level } = req.body;

    const [result] = await db.query(
      `UPDATE stock_levels SET 
       product_id = ?, warehouse_id = ?, min_stock_level = ?, max_stock_level = ?
       WHERE stock_id = ?`,
      [product_id, warehouse_id, min_stock_level, max_stock_level, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Stock level not found' });
    }

    res.json({ message: 'Stock level updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

exports.deleteStockLevel = async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM stock_levels WHERE stock_id = ?', 
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Stock level not found' });
    }
    res.json({ message: 'Stock level deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

