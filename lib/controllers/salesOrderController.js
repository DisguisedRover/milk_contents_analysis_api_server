const db = require('../models/db');
const salesOrderSchema = require('../validators/sales/salesOrdersValidator');

exports.getSalesOrders = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM sales_orders');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

exports.getSalesOrderById = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM sales_orders WHERE so_id = ?', 
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Sales order not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

exports.createSalesOrder = async (req, res) => {
  try {
    const { error } = salesOrderSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const userId = req.user.id;
    const { customer_name, customer_contact, warehouse_id, order_number, 
      order_date, delivery_date, status, payment_status, total_amount, 
      tax_amount, discount_amount, notes } = req.body;

    const [result] = await db.query(
      `INSERT INTO sales_orders 
       (customer_name, customer_contact, warehouse_id, order_number, order_date, 
        delivery_date, status, payment_status, total_amount, tax_amount, 
        discount_amount, notes, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [customer_name, customer_contact, warehouse_id, order_number, order_date, 
        delivery_date, status, payment_status, total_amount, tax_amount, 
        discount_amount, notes, userId]
    );

    const [newSO] = await db.query(
      'SELECT * FROM sales_orders WHERE so_id = ?',
      [result.insertId]
    );

    res.status(201).json(newSO[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

exports.updateSalesOrder = async (req, res) => {
  try {
    const { error } = salesOrderSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { customer_name, customer_contact, warehouse_id, order_number, 
      order_date, delivery_date, status, payment_status, total_amount, 
      tax_amount, discount_amount, notes } = req.body;

    const [result] = await db.query(
      `UPDATE sales_orders SET 
       customer_name = ?, customer_contact = ?, warehouse_id = ?, order_number = ?, 
       order_date = ?, delivery_date = ?, status = ?, payment_status = ?, 
       total_amount = ?, tax_amount = ?, discount_amount = ?, notes = ?
       WHERE so_id = ?`,
      [customer_name, customer_contact, warehouse_id, order_number, order_date, 
        delivery_date, status, payment_status, total_amount, tax_amount, 
        discount_amount, notes, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Sales order not found' });
    }

    res.json({ message: 'Sales order updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

exports.deleteSalesOrder = async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM sales_orders WHERE so_id = ?', 
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Sales order not found' });
    }
    res.json({ message: 'Sales order deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};



// Confirm sales order
exports.confirmSalesOrder = async (req, res) => {
  try {
    const soId = req.params.id;

    const [so] = await db.query(
      'SELECT * FROM sales_orders WHERE so_id = ? AND status = "PENDING"',
      [soId]
    );

    if (so.length === 0) {
      return res.status(400).json({ 
        error: 'Sales order not found or not in pending status' 
      });
    }

    await db.query(
      'UPDATE sales_orders SET status = "CONFIRMED" WHERE so_id = ?',
      [soId]
    );

    res.json({ message: 'Sales order confirmed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

// Deliver sales order (deduct stock)
exports.deliverSalesOrder = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const userId = req.user.id;
    const soId = req.params.id;

    // Get SO details
    const [so] = await connection.query(
      'SELECT * FROM sales_orders WHERE so_id = ? AND status = "CONFIRMED"',
      [soId]
    );

    if (so.length === 0) {
      throw new Error('Sales order not found or not confirmed');
    }

    // Get all items
    const [items] = await connection.query(
      'SELECT * FROM so_items WHERE so_id = ?',
      [soId]
    );

    // Check stock availability and create transactions
    for (const item of items) {
      // Check stock
      const [stock] = await connection.query(
        'SELECT quantity FROM stock_levels WHERE product_id = ? AND warehouse_id = ?',
        [item.product_id, so[0].warehouse_id]
      );

      if (stock.length === 0 || stock[0].quantity < item.quantity) {
        throw new Error(`Insufficient stock for product ${item.product_id}`);
      }

      // Create stock transaction
      await connection.query(
        `INSERT INTO stock_transactions 
         (product_id, warehouse_id, transaction_type, quantity, reference_id, 
          reference_type, created_by)
         VALUES (?, ?, "OUT", ?, ?, "SALE", ?)`,
        [item.product_id, so[0].warehouse_id, item.quantity, soId, userId]
      );

      // Update stock levels
      await connection.query(
        'UPDATE stock_levels SET quantity = quantity - ? WHERE product_id = ? AND warehouse_id = ?',
        [item.quantity, item.product_id, so[0].warehouse_id]
      );
    }

    // Update SO status
    await connection.query(
      'UPDATE sales_orders SET status = "DELIVERED" WHERE so_id = ?',
      [soId]
    );

    await connection.commit();
    res.json({ message: 'Sales order delivered successfully' });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ error: err.message || 'Database Error' });
  } finally {
    connection.release();
  }
};

// Get sales orders by payment status
exports.getSalesOrdersByPaymentStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const [rows] = await db.query(
      'SELECT * FROM sales_orders WHERE payment_status = ?',
      [status.toUpperCase()]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

// Get unpaid sales orders
exports.getUnpaidSalesOrders = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM sales_orders WHERE payment_status IN ("UNPAID", "PARTIAL")'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};


exports.createSalesOrder = async (req, res) => {
  try {
    const { error } = salesOrderSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const userId = req.user.id;
    const { customer_id, warehouse_id, order_number, order_date, 
      delivery_date, status, payment_status, total_amount, tax_amount, 
      discount_amount, notes } = req.body;

    // Verify customer exists
    const [customer] = await db.query(
      'SELECT customer_id FROM customers WHERE customer_id = ?',
      [customer_id]
    );

    if (customer.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const [result] = await db.query(
      `INSERT INTO sales_orders 
       (customer_id, warehouse_id, order_number, order_date, delivery_date, 
        status, payment_status, total_amount, tax_amount, discount_amount, 
        notes, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [customer_id, warehouse_id, order_number, order_date, delivery_date, 
        status, payment_status, total_amount, tax_amount, discount_amount, 
        notes, userId]
    );

    const [newSO] = await db.query(
      `SELECT so.*, c.customer_code, u.username as customer_name
       FROM sales_orders so
       JOIN customers c ON so.customer_id = c.customer_id
       JOIN users u ON c.user_id = u.id
       WHERE so.so_id = ?`,
      [result.insertId]
    );

    res.status(201).json(newSO[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

exports.getSalesOrders = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT so.*, c.customer_code, u.username as customer_name, u.email as customer_email
       FROM sales_orders so
       JOIN customers c ON so.customer_id = c.customer_id
       JOIN users u ON c.user_id = u.id
       ORDER BY so.order_date DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

exports.getSalesOrderById = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT so.*, c.customer_code, c.phone, c.address, 
              u.username as customer_name, u.email as customer_email
       FROM sales_orders so
       JOIN customers c ON so.customer_id = c.customer_id
       JOIN users u ON c.user_id = u.id
       WHERE so.so_id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Sales order not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

