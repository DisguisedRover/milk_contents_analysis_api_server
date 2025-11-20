const db = require('../models/db');
const paymentsSchema = require('../validators/paymentsValidator');

exports.getPayments = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM payments');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

exports.getPaymentById = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM payments WHERE payment_id = ?', 
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

exports.createPayment = async (req, res) => {
  try {
    const { error } = paymentsSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const userId = req.user.id;
    const { payment_number, reference_type, reference_id, payment_date, 
      amount, payment_method, transaction_reference, bank_name, cheque_number, 
      cheque_date, notes, status } = req.body;

    const [result] = await db.query(
      `INSERT INTO payments 
       (payment_number, reference_type, reference_id, payment_date, amount, 
        payment_method, transaction_reference, bank_name, cheque_number, 
        cheque_date, notes, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [payment_number, reference_type, reference_id, payment_date, amount, 
        payment_method, transaction_reference, bank_name, cheque_number, 
        cheque_date, notes, status, userId]
    );

    const [newPayment] = await db.query(
      'SELECT * FROM payments WHERE payment_id = ?',
      [result.insertId]
    );

    res.status(201).json(newPayment[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

exports.updatePayment = async (req, res) => {
  try {
    const { error } = paymentsSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const userId = req.user.id;
    const { payment_number, reference_type, reference_id, payment_date, 
      amount, payment_method, transaction_reference, bank_name, cheque_number, 
      cheque_date, notes, status } = req.body;

    const [result] = await db.query(
      `UPDATE payments SET 
       payment_number = ?, reference_type = ?, reference_id = ?, payment_date = ?, 
       amount = ?, payment_method = ?, transaction_reference = ?, bank_name = ?, 
       cheque_number = ?, cheque_date = ?, notes = ?, status = ?, updated_by = ?
       WHERE payment_id = ?`,
      [payment_number, reference_type, reference_id, payment_date, amount, 
        payment_method, transaction_reference, bank_name, cheque_number, 
        cheque_date, notes, status, userId, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json({ message: 'Payment updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

exports.deletePayment = async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM payments WHERE payment_id = ?', 
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.json({ message: 'Payment deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};


// Record payment and update order status
exports.recordPayment = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const userId = req.user.id;
    const { payment_number, reference_type, reference_id, payment_date, 
      amount, payment_method, transaction_reference, notes } = req.body;

    // Insert payment
    const [result] = await connection.query(
      `INSERT INTO payments 
       (payment_number, reference_type, reference_id, payment_date, amount, 
        payment_method, transaction_reference, notes, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, "COMPLETED", ?)`,
      [payment_number, reference_type, reference_id, payment_date, amount, 
        payment_method, transaction_reference, notes, userId]
    );

    // Update sales order payment status if applicable
    if (reference_type === 'SALE') {
      const [so] = await connection.query(
        'SELECT total_amount FROM sales_orders WHERE so_id = ?',
        [reference_id]
      );

      const [payments] = await connection.query(
        'SELECT SUM(amount) as paid FROM payments WHERE reference_type = "SALE" AND reference_id = ? AND status = "COMPLETED"',
        [reference_id]
      );

      const totalPaid = payments[0].paid || 0;
      const totalAmount = so[0].total_amount;

      let paymentStatus = 'UNPAID';
      if (totalPaid >= totalAmount) {
        paymentStatus = 'PAID';
      } else if (totalPaid > 0) {
        paymentStatus = 'PARTIAL';
      }

      await connection.query(
        'UPDATE sales_orders SET payment_status = ? WHERE so_id = ?',
        [paymentStatus, reference_id]
      );
    }

    await connection.commit();
    
    const [newPayment] = await connection.query(
      'SELECT * FROM payments WHERE payment_id = ?',
      [result.insertId]
    );

    res.status(201).json(newPayment[0]);
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  } finally {
    connection.release();
  }
};

// Get payments by reference
exports.getPaymentsByReference = async (req, res) => {
  try {
    const { type, id } = req.params;
    const [rows] = await db.query(
      'SELECT * FROM payments WHERE reference_type = ? AND reference_id = ?',
      [type.toUpperCase(), id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

