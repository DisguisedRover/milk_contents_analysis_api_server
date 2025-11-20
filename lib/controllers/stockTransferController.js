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


// Approve stock transfer
exports.approveStockTransfer = async (req, res) => {
  try {
    const userId = req.user.id;
    const transferId = req.params.id;

    const [transfer] = await db.query(
      'SELECT * FROM stock_transfers WHERE transfer_id = ? AND status = "PENDING"',
      [transferId]
    );

    if (transfer.length === 0) {
      return res.status(400).json({ 
        error: 'Stock transfer not found or not in pending status' 
      });
    }

    await db.query(
      'UPDATE stock_transfers SET status = "IN_TRANSIT", approved_by = ? WHERE transfer_id = ?',
      [userId, transferId]
    );

    res.json({ message: 'Stock transfer approved successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

// Complete stock transfer (move stock between warehouses)
exports.completeStockTransfer = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const userId = req.user.id;
    const transferId = req.params.id;

    // Get transfer details
    const [transfer] = await connection.query(
      'SELECT * FROM stock_transfers WHERE transfer_id = ? AND status = "IN_TRANSIT"',
      [transferId]
    );

    if (transfer.length === 0) {
      throw new Error('Stock transfer not found or not in transit');
    }

    // Get all items
    const [items] = await connection.query(
      'SELECT * FROM stock_transfer_items WHERE transfer_id = ?',
      [transferId]
    );

    for (const item of items) {
      // Check source warehouse stock
      const [stock] = await connection.query(
        'SELECT quantity FROM stock_levels WHERE product_id = ? AND warehouse_id = ?',
        [item.product_id, transfer[0].from_warehouse_id]
      );

      if (stock.length === 0 || stock[0].quantity < item.requested_quantity) {
        throw new Error(`Insufficient stock for product ${item.product_id} in source warehouse`);
      }

      // Deduct from source warehouse
      await connection.query(
        'UPDATE stock_levels SET quantity = quantity - ? WHERE product_id = ? AND warehouse_id = ?',
        [item.requested_quantity, item.product_id, transfer[0].from_warehouse_id]
      );

      // Add to destination warehouse
      await connection.query(
        `INSERT INTO stock_levels (product_id, warehouse_id, quantity, created_by)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE quantity = quantity + ?`,
        [item.product_id, transfer[0].to_warehouse_id, item.requested_quantity, userId, item.requested_quantity]
      );

      // Create stock transactions for both warehouses
      await connection.query(
        `INSERT INTO stock_transactions 
         (product_id, warehouse_id, transaction_type, quantity, reference_id, 
          reference_type, created_by)
         VALUES (?, ?, "TRANSFER", ?, ?, "TRANSFER", ?),
                (?, ?, "TRANSFER", ?, ?, "TRANSFER", ?)`,
        [item.product_id, transfer[0].from_warehouse_id, -item.requested_quantity, transferId, userId,
         item.product_id, transfer[0].to_warehouse_id, item.requested_quantity, transferId, userId]
      );

      // Update transfer item
      await connection.query(
        'UPDATE stock_transfer_items SET transferred_quantity = ?, received_quantity = ? WHERE transfer_item_id = ?',
        [item.requested_quantity, item.requested_quantity, item.transfer_item_id]
      );
    }

    // Update transfer status
    await connection.query(
      'UPDATE stock_transfers SET status = "COMPLETED", actual_date = NOW(), received_by = ? WHERE transfer_id = ?',
      [userId, transferId]
    );

    await connection.commit();
    res.json({ message: 'Stock transfer completed successfully' });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ error: err.message || 'Database Error' });
  } finally {
    connection.release();
  }
};

