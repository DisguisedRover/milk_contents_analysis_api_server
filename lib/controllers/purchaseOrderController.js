const db = require('../models/db');
const purchaseOrderSchema = require('../validators/purchaseOrdersValidator');

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
