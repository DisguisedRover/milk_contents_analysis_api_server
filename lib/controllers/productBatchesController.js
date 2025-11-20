const db = require('../models/db');
const productBatchSchema = require('../validators/product/productBatchesValidator');

exports.getProductBatches = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM product_batches');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

exports.getProductBatchById = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM product_batches WHERE batch_id = ?', 
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product batch not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

exports.createProductBatch = async (req, res) => {
  try {
    const { error } = productBatchSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const userId = req.user.id;
    const { product_id, batch_number, warehouse_id, supplier_id, 
      purchase_order_id, manufacture_date, expiry_date, initial_quantity, 
      current_quantity, cost_price, mrp, notes, is_active } = req.body;

    const [result] = await db.query(
      `INSERT INTO product_batches 
       (product_id, batch_number, warehouse_id, supplier_id, purchase_order_id, 
        manufacture_date, expiry_date, initial_quantity, current_quantity, 
        cost_price, mrp, notes, is_active, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [product_id, batch_number, warehouse_id, supplier_id, purchase_order_id, 
        manufacture_date, expiry_date, initial_quantity, current_quantity, 
        cost_price, mrp, notes, is_active, userId]
    );

    const [newBatch] = await db.query(
      'SELECT * FROM product_batches WHERE batch_id = ?',
      [result.insertId]
    );

    res.status(201).json(newBatch[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

exports.updateProductBatch = async (req, res) => {
  try {
    const { error } = productBatchSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const userId = req.user.id;
    const { product_id, batch_number, warehouse_id, supplier_id, 
      purchase_order_id, manufacture_date, expiry_date, initial_quantity, 
      current_quantity, cost_price, mrp, notes, is_active } = req.body;

    const [result] = await db.query(
      `UPDATE product_batches SET 
       product_id = ?, batch_number = ?, warehouse_id = ?, supplier_id = ?, 
       purchase_order_id = ?, manufacture_date = ?, expiry_date = ?, 
       initial_quantity = ?, current_quantity = ?, cost_price = ?, mrp = ?, 
       notes = ?, is_active = ?, updated_by = ?
       WHERE batch_id = ?`,
      [product_id, batch_number, warehouse_id, supplier_id, purchase_order_id, 
        manufacture_date, expiry_date, initial_quantity, current_quantity, 
        cost_price, mrp, notes, is_active, userId, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product batch not found' });
    }

    res.json({ message: 'Product batch updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

exports.deleteProductBatch = async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM product_batches WHERE batch_id = ?', 
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product batch not found' });
    }
    res.json({ message: 'Product batch deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};


// Get expiring batches (within next 30 days)
exports.getExpiringBatches = async (req, res) => {
  try {
    const days = req.query.days || 30;
    const [rows] = await db.query(
      `SELECT pb.*, pm.product_name, w.name as warehouse_name 
       FROM product_batches pb
       JOIN product_master pm ON pb.product_id = pm.product_id
       JOIN warehouses w ON pb.warehouse_id = w.warehouse_id
       WHERE pb.expiry_date IS NOT NULL 
       AND pb.expiry_date <= DATE_ADD(CURDATE(), INTERVAL ? DAY)
       AND pb.current_quantity > 0
       AND pb.is_active = TRUE
       ORDER BY pb.expiry_date ASC`,
      [days]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

// Get expired batches
exports.getExpiredBatches = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT pb.*, pm.product_name, w.name as warehouse_name 
       FROM product_batches pb
       JOIN product_master pm ON pb.product_id = pm.product_id
       JOIN warehouses w ON pb.warehouse_id = w.warehouse_id
       WHERE pb.expiry_date < CURDATE()
       AND pb.current_quantity > 0
       AND pb.is_active = TRUE`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};


// =============================================
// CUSTOMERS - Specialized Functions
// =============================================

// Get customer with outstanding balance
exports.getCustomersWithOutstanding = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM customers WHERE outstanding_balance > 0 AND deleted_at IS NULL'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

// Get customer order history
exports.getCustomerOrderHistory = async (req, res) => {
  try {
    const customerId = req.params.id;
    const [rows] = await db.query(
      'SELECT * FROM sales_orders WHERE customer_id = ? ORDER BY order_date DESC',
      [customerId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

