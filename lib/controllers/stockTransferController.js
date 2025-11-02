const db = require('../models/db');
const stockTransferSchema = require('../validators/stock/stockTransfersValidator');

exports.getStockTransfers = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM stock_transfers');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

exports.getStockTransferById = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM stock_transfers WHERE transfer_id = ?', 
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Stock transfer not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

exports.createStockTransfer = async (req, res) => {
  try {
    const { error } = stockTransferSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const userId = req.user.id;
    const { transfer_number, from_warehouse_id, to_warehouse_id, transfer_date, 
      expected_date, status, notes, reason } = req.body;

    const [result] = await db.query(
      `INSERT INTO stock_transfers 
       (transfer_number, from_warehouse_id, to_warehouse_id, transfer_date, 
        expected_date, status, notes, reason, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [transfer_number, from_warehouse_id, to_warehouse_id, transfer_date, 
        expected_date, status, notes, reason, userId]
    );

    const [newTransfer] = await db.query(
      'SELECT * FROM stock_transfers WHERE transfer_id = ?',
      [result.insertId]
    );

    res.status(201).json(newTransfer[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

exports.updateStockTransfer = async (req, res) => {
  try {
    const { error } = stockTransferSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const userId = req.user.id;
    const { transfer_number, from_warehouse_id, to_warehouse_id, transfer_date, 
      expected_date, status, notes, reason } = req.body;

    const [result] = await db.query(
      `UPDATE stock_transfers SET 
       transfer_number = ?, from_warehouse_id = ?, to_warehouse_id = ?, 
       transfer_date = ?, expected_date = ?, status = ?, notes = ?, 
       reason = ?, updated_by = ?
       WHERE transfer_id = ?`,
      [transfer_number, from_warehouse_id, to_warehouse_id, transfer_date, 
        expected_date, status, notes, reason, userId, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Stock transfer not found' });
    }

    res.json({ message: 'Stock transfer updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

exports.deleteStockTransfer = async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM stock_transfers WHERE transfer_id = ?', 
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Stock transfer not found' });
    }
    res.json({ message: 'Stock transfer deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};
