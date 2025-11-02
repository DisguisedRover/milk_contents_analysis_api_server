const db = require('../models/db');
const stockTransactionSchema = require('../validators/stock/stockTransactionValidator');

exports.getStockTransactions = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM stock_transactions');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

exports.getStockTransactionById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM stock_transactions WHERE transaction_id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Stock transaction not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

exports.createStockTransaction = async (req, res) => {
  try {
    const { error } = stockTransactionSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const userId = req.user.id;
    
    const { product_id, warehouse_id, transaction_type, quantity, 
            reference_id, reference_type, notes } = req.body;

    const [result] = await db.query(
      `INSERT INTO stock_transactions 
       (product_id, warehouse_id, transaction_type, quantity, 
        reference_id, reference_type, notes, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [product_id, warehouse_id, transaction_type, quantity, 
       reference_id, reference_type, notes, userId]
    );

    const [newTransaction] = await db.query(
      `SELECT * FROM stock_transactions WHERE transaction_id = ?`,
      [result.insertId]
    );

    res.status(201).json(newTransaction[0]);
  } catch (err) {
    console.error('Database Error:', err);
    res.status(500).json({ error: 'Database operation failed' });
  }
};

exports.editStockTransaction = async (req, res) => {
  try {
    const { error } = stockTransactionSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { product_id, warehouse_id, transaction_type, quantity, 
            reference_id, reference_type, notes } = req.body;

    const [result] = await db.query(
      `UPDATE stock_transactions 
       SET product_id = ?, warehouse_id = ?, transaction_type = ?, quantity = ?, 
           reference_id = ?, reference_type = ?, notes = ?, updated_at = NOW()
       WHERE transaction_id = ?`,
      [product_id, warehouse_id, transaction_type, quantity, 
       reference_id, reference_type, notes, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Stock transaction not found' });
    }

    res.json({ message: 'Stock transaction updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

exports.deleteStockTransaction = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM stock_transactions WHERE transaction_id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Stock transaction not found' });
    }
    res.json({ message: 'Stock transaction deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};