const db = require('../models/db');
const purchaseOrderSchema = require('../validators/purchase/purchaseOrdersValidator');

exports.getPurchaseOrders = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM purchase_orders');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

exports.getPurchaseOrderById = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM purchase_orders WHERE po_id = ?', 
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

exports.createPurchaseOrder = async (req, res) => {
  try {
    const { error } = purchaseOrderSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const userId = req.user.id;
    const { supplier_id, warehouse_id, po_number, order_date, expected_date, 
      status, total_amount, tax_amount, notes } = req.body;

    const [result] = await db.query(
      `INSERT INTO purchase_orders 
       (supplier_id, warehouse_id, po_number, order_date, expected_date, 
        status, total_amount, tax_amount, notes, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [supplier_id, warehouse_id, po_number, order_date, expected_date, 
        status, total_amount, tax_amount, notes, userId]
    );

    const [newPO] = await db.query(
      'SELECT * FROM purchase_orders WHERE po_id = ?',
      [result.insertId]
    );

    res.status(201).json(newPO[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

exports.updatePurchaseOrder = async (req, res) => {
  try {
    const { error } = purchaseOrderSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { supplier_id, warehouse_id, po_number, order_date, expected_date, 
      status, total_amount, tax_amount, notes } = req.body;

    const [result] = await db.query(
      `UPDATE purchase_orders SET 
       supplier_id = ?, warehouse_id = ?, po_number = ?, order_date = ?, 
       expected_date = ?, status = ?, total_amount = ?, tax_amount = ?, notes = ?
       WHERE po_id = ?`,
      [supplier_id, warehouse_id, po_number, order_date, expected_date, 
        status, total_amount, tax_amount, notes, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }

    res.json({ message: 'Purchase order updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

exports.deletePurchaseOrder = async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM purchase_orders WHERE po_id = ?', 
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }
    res.json({ message: 'Purchase order deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

exports.approvePurchaseOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const poId = req.params.id;

    // Check if PO exists and is in PENDING status
    const [po] = await db.query(
      'SELECT * FROM purchase_orders WHERE po_id = ? AND status = "PENDING"',
      [poId]
    );

    if (po.length === 0) {
      return res.status(400).json({ 
        error: 'Purchase order not found or not in pending status' 
      });
    }

    await db.query(
      'UPDATE purchase_orders SET status = "APPROVED", approved_by = ?, approved_at = NOW() WHERE po_id = ?',
      [userId, poId]
    );

    res.json({ message: 'Purchase order approved successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

// Receive purchase order (create receipt)
exports.receivePurchaseOrder = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const userId = req.user.id;
    const poId = req.params.id;
    const { items } = req.body; 

    // Get PO details
    const [po] = await connection.query(
      'SELECT * FROM purchase_orders WHERE po_id = ? AND status = "APPROVED"',
      [poId]
    );

    if (po.length === 0) {
      throw new Error('Purchase order not found or not approved');
    }

    // Update each item and create stock transactions
    for (const item of items) {
      const { po_item_id, received_quantity } = item;

      // Update po_items
      await connection.query(
        'UPDATE po_items SET received_quantity = received_quantity + ? WHERE po_item_id = ?',
        [received_quantity, po_item_id]
      );

      // Get product and warehouse info
      const [poItem] = await connection.query(
        'SELECT product_id FROM po_items WHERE po_item_id = ?',
        [po_item_id]
      );

      // Create stock transaction
      await connection.query(
        `INSERT INTO stock_transactions 
         (product_id, warehouse_id, transaction_type, quantity, reference_id, 
          reference_type, created_by)
         VALUES (?, ?, "IN", ?, ?, "PURCHASE", ?)`,
        [poItem[0].product_id, po[0].warehouse_id, received_quantity, poId, userId]
      );

      // Update stock levels
      await connection.query(
        `INSERT INTO stock_levels (product_id, warehouse_id, quantity, created_by)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE quantity = quantity + ?`,
        [poItem[0].product_id, po[0].warehouse_id, received_quantity, userId, received_quantity]
      );
    }

    // Update PO status to RECEIVED
    await connection.query(
      'UPDATE purchase_orders SET status = "RECEIVED" WHERE po_id = ?',
      [poId]
    );

    await connection.commit();
    res.json({ message: 'Purchase order received successfully' });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ error: err.message || 'Database Error' });
  } finally {
    connection.release();
  }
};

// Get purchase orders by status
exports.getPurchaseOrdersByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const [rows] = await db.query(
      'SELECT * FROM purchase_orders WHERE status = ?',
      [status.toUpperCase()]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

// Get pending purchase orders
exports.getPendingPurchaseOrders = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM purchase_orders WHERE status IN ("DRAFT", "PENDING")'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};
