// const db = require('../models/db');
// const customersSchema = require('../validators/customer/customersValidator');

// exports.getCustomers = async (req, res) => {
//   try {
//     const [rows] = await db.query(
//       'SELECT * FROM customers WHERE deleted_at IS NULL'
//     );
//     res.json(rows);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Database Error' });
//   }
// };

// exports.getCustomerById = async (req, res) => {
//   try {
//     const [rows] = await db.query(
//       'SELECT * FROM customers WHERE customer_id = ? AND deleted_at IS NULL', 
//       [req.params.id]
//     );
//     if (rows.length === 0) {
//       return res.status(404).json({ error: 'Customer not found' });
//     }
//     res.json(rows[0]);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Database Error' });
//   }
// };

// exports.createCustomer = async (req, res) => {
//   try {
//     const { error } = customersSchema.validate(req.body);
//     if (error) return res.status(400).json({ error: error.details[0].message });

//     const userId = req.user.id;
//     const { customer_code, customer_name, customer_type, contact_person, 
//       email, phone, mobile, address, city, state, country, postal_code, 
//       tax_id, pan_number, credit_limit, payment_terms, notes, is_active } = req.body;

//     const [result] = await db.query(
//       `INSERT INTO customers 
//        (customer_code, customer_name, customer_type, contact_person, email, 
//         phone, mobile, address, city, state, country, postal_code, tax_id, 
//         pan_number, credit_limit, payment_terms, notes, is_active, created_by)
//        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//       [customer_code, customer_name, customer_type, contact_person, email, 
//         phone, mobile, address, city, state, country, postal_code, tax_id, 
//         pan_number, credit_limit, payment_terms, notes, is_active, userId]
//     );

//     const [newCustomer] = await db.query(
//       'SELECT * FROM customers WHERE customer_id = ?',
//       [result.insertId]
//     );

//     res.status(201).json(newCustomer[0]);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Database Error' });
//   }
// };

// exports.updateCustomer = async (req, res) => {
//   try {
//     const { error } = customersSchema.validate(req.body);
//     if (error) return res.status(400).json({ error: error.details[0].message });

//     const userId = req.user.id;
//     const { customer_code, customer_name, customer_type, contact_person, 
//       email, phone, mobile, address, city, state, country, postal_code, 
//       tax_id, pan_number, credit_limit, payment_terms, notes, is_active } = req.body;

//     const [result] = await db.query(
//       `UPDATE customers SET 
//        customer_code = ?, customer_name = ?, customer_type = ?, contact_person = ?, 
//        email = ?, phone = ?, mobile = ?, address = ?, city = ?, state = ?, 
//        country = ?, postal_code = ?, tax_id = ?, pan_number = ?, credit_limit = ?, 
//        payment_terms = ?, notes = ?, is_active = ?, updated_by = ?
//        WHERE customer_id = ? AND deleted_at IS NULL`,
//       [customer_code, customer_name, customer_type, contact_person, email, 
//         phone, mobile, address, city, state, country, postal_code, tax_id, 
//         pan_number, credit_limit, payment_terms, notes, is_active, userId, 
//         req.params.id]
//     );

//     if (result.affectedRows === 0) {
//       return res.status(404).json({ error: 'Customer not found' });
//     }

//     res.json({ message: 'Customer updated successfully' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Database Error' });
//   }
// };

// exports.deleteCustomer = async (req, res) => {
//   try {
//     const userId = req.user.id;
    
//     const [result] = await db.query(
//       'UPDATE customers SET deleted_at = NOW(), deleted_by = ? WHERE customer_id = ?',
//       [userId, req.params.id]
//     );

//     if (result.affectedRows === 0) {
//       return res.status(404).json({ error: 'Customer not found' });
//     }

//     res.json({ message: 'Customer deleted successfully' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Database Error' });
//   }
// };


// // Get customer with outstanding balance
// exports.getCustomersWithOutstanding = async (req, res) => {
//   try {
//     const [rows] = await db.query(
//       'SELECT * FROM customers WHERE outstanding_balance > 0 AND deleted_at IS NULL'
//     );
//     res.json(rows);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Database Error' });
//   }
// };

// // Get customer order history
// exports.getCustomerOrderHistory = async (req, res) => {
//   try {
//     const customerId = req.params.id;
//     const [rows] = await db.query(
//       'SELECT * FROM sales_orders WHERE customer_id = ? ORDER BY order_date DESC',
//       [customerId]
//     );
//     res.json(rows);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Database Error' });
//   }
// };



const db = require('../models/db');
const bcrypt = require('bcryptjs');
const customersSchema = require('../validators/customer/customersValidator');

exports.getCustomers = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT c.*, u.username, u.email, u.is_active as user_active
       FROM customers c
       JOIN users u ON c.user_id = u.id
       WHERE u.user_type = 'customer'`
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
      `SELECT c.*, u.username, u.email, u.is_active as user_active
       FROM customers c
       JOIN users u ON c.user_id = u.id
       WHERE c.customer_id = ?`,
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
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const { error } = customersSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const staffUserId = req.user.id;
    const { username, email, password, customer_code, customer_type, 
      contact_person, phone, mobile, address, city, state, country, 
      postal_code, tax_id, pan_number, credit_limit, payment_terms, 
      notes, is_active } = req.body;

    // Check if customer_code already exists
    const [existing] = await connection.query(
      'SELECT customer_id FROM customers WHERE customer_code = ?',
      [customer_code]
    );

    if (existing.length > 0) {
      throw new Error('Customer code already exists');
    }

    let userId;

    // If email/password provided, create user account
    if (email && password) {
      // Check if email exists
      const [existingUser] = await connection.query(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      if (existingUser.length > 0) {
        throw new Error('Email already exists');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user account
      const [userResult] = await connection.query(
        `INSERT INTO users (username, email, password_hash, role, user_type, is_active)
         VALUES (?, ?, ?, 'user', 'customer', ?)`,
        [username, email, hashedPassword, is_active]
      );

      userId = userResult.insertId;
    } else {
      // Create user without login (no email/password)
      const [userResult] = await connection.query(
        `INSERT INTO users (username, role, user_type, is_active)
         VALUES (?, 'user', 'customer', ?)`,
        [username, is_active]
      );

      userId = userResult.insertId;
    }

    // Create customer record
    const [customerResult] = await connection.query(
      `INSERT INTO customers 
       (user_id, customer_code, customer_type, contact_person, phone, mobile, 
        address, city, state, country, postal_code, tax_id, pan_number, 
        credit_limit, payment_terms, notes, is_active, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, customer_code, customer_type, contact_person, phone, mobile, 
        address, city, state, country, postal_code, tax_id, pan_number, 
        credit_limit, payment_terms, notes, is_active, staffUserId]
    );

    await connection.commit();

    // Fetch the complete customer data
    const [newCustomer] = await connection.query(
      `SELECT c.*, u.username, u.email
       FROM customers c
       JOIN users u ON c.user_id = u.id
       WHERE c.customer_id = ?`,
      [customerResult.insertId]
    );

    res.status(201).json(newCustomer[0]);
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ error: err.message || 'Database Error' });
  } finally {
    connection.release();
  }
};

exports.updateCustomer = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const { error } = customersSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const staffUserId = req.user.id;
    const customerId = req.params.id;
    const { username, email, customer_code, customer_type, contact_person, 
      phone, mobile, address, city, state, country, postal_code, tax_id, 
      pan_number, credit_limit, payment_terms, notes, is_active } = req.body;

    // Get customer's user_id
    const [customer] = await connection.query(
      'SELECT user_id FROM customers WHERE customer_id = ?',
      [customerId]
    );

    if (customer.length === 0) {
      throw new Error('Customer not found');
    }

    const userId = customer[0].user_id;

    // Update user record
    await connection.query(
      'UPDATE users SET username = ?, email = ?, is_active = ? WHERE id = ?',
      [username, email || null, is_active, userId]
    );

    // Update customer record
    const [result] = await connection.query(
      `UPDATE customers SET 
       customer_code = ?, customer_type = ?, contact_person = ?, phone = ?, 
       mobile = ?, address = ?, city = ?, state = ?, country = ?, postal_code = ?, 
       tax_id = ?, pan_number = ?, credit_limit = ?, payment_terms = ?, 
       notes = ?, is_active = ?, updated_by = ?
       WHERE customer_id = ?`,
      [customer_code, customer_type, contact_person, phone, mobile, address, 
        city, state, country, postal_code, tax_id, pan_number, credit_limit, 
        payment_terms, notes, is_active, staffUserId, customerId]
    );

    if (result.affectedRows === 0) {
      throw new Error('Customer not found');
    }

    await connection.commit();
    res.json({ message: 'Customer updated successfully' });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ error: err.message || 'Database Error' });
  } finally {
    connection.release();
  }
};

exports.deleteCustomer = async (req, res) => {
  try {
    // This will cascade delete the customer record due to FK
    const [customer] = await db.query(
      'SELECT user_id FROM customers WHERE customer_id = ?',
      [req.params.id]
    );

    if (customer.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Delete user (will cascade to customer)
    const [result] = await db.query(
      'DELETE FROM users WHERE id = ?',
      [customer[0].user_id]
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

// Get customers with outstanding balance
exports.getCustomersWithOutstanding = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT c.*, u.username, u.email
       FROM customers c
       JOIN users u ON c.user_id = u.id
       WHERE c.outstanding_balance > 0`
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
