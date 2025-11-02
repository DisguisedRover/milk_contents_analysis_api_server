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
