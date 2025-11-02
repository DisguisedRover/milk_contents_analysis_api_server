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

