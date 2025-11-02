const db = require('../models/db');
const customersSchema = require('../validators/customer/customersValidator');

exports.getCustomers = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM customers WHERE deleted_at IS NULL'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

exports.getCustomerById = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM customers WHERE customer_id = ? AND deleted_at IS NULL', 
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

exports.createCustomer = async (req, res) => {
  try {
    const { error } = customersSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const userId = req.user.id;
    const { customer_code, customer_name, customer_type, contact_person, 
      email, phone, mobile, address, city, state, country, postal_code, 
      tax_id, pan_number, credit_limit, payment_terms, notes, is_active } = req.body;

    const [result] = await db.query(
      `INSERT INTO customers 
       (customer_code, customer_name, customer_type, contact_person, email, 
        phone, mobile, address, city, state, country, postal_code, tax_id, 
        pan_number, credit_limit, payment_terms, notes, is_active, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [customer_code, customer_name, customer_type, contact_person, email, 
        phone, mobile, address, city, state, country, postal_code, tax_id, 
        pan_number, credit_limit, payment_terms, notes, is_active, userId]
    );

    const [newCustomer] = await db.query(
      'SELECT * FROM customers WHERE customer_id = ?',
      [result.insertId]
    );

    res.status(201).json(newCustomer[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

exports.updateCustomer = async (req, res) => {
  try {
    const { error } = customersSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const userId = req.user.id;
    const { customer_code, customer_name, customer_type, contact_person, 
      email, phone, mobile, address, city, state, country, postal_code, 
      tax_id, pan_number, credit_limit, payment_terms, notes, is_active } = req.body;

    const [result] = await db.query(
      `UPDATE customers SET 
       customer_code = ?, customer_name = ?, customer_type = ?, contact_person = ?, 
       email = ?, phone = ?, mobile = ?, address = ?, city = ?, state = ?, 
       country = ?, postal_code = ?, tax_id = ?, pan_number = ?, credit_limit = ?, 
       payment_terms = ?, notes = ?, is_active = ?, updated_by = ?
       WHERE customer_id = ? AND deleted_at IS NULL`,
      [customer_code, customer_name, customer_type, contact_person, email, 
        phone, mobile, address, city, state, country, postal_code, tax_id, 
        pan_number, credit_limit, payment_terms, notes, is_active, userId, 
        req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({ message: 'Customer updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

exports.deleteCustomer = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [result] = await db.query(
      'UPDATE customers SET deleted_at = NOW(), deleted_by = ? WHERE customer_id = ?',
      [userId, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({ message: 'Customer deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

