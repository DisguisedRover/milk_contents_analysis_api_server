const { response } = require('express');
const db = require('../models/db');
const productSchema = require('../validators/productValidator');

exports.getProduct = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM product_master');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM product_master WHERE product_id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

exports.saveProduct = async (req, res) => {
  try {
    const { error } = productSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const userId = req.user.id;
    
    const { product_name, type, category, subCategory, isTaxable,
      isKeepingStock, savedIn, status } = req.body;

    const [result] = await db.query(
      `INSERT INTO product_master 
       (product_name, type, category, subCategory, isTaxable, 
        isKeepingStock, savedBy, savedIn, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [product_name, type, category, subCategory || null, isTaxable,
        isKeepingStock, userId, savedIn, status]
    );

    const [newProduct] = await db.query(
      `SELECT * FROM product_master WHERE product_id = ?`,
      [result.insertId]
    );

    res.status(201).json(newProduct[0]);
  } catch (err) {
    console.error('Database Error:', err);
    res.status(500).json({ error: 'Database operation failed' });
  }
};


exports.deleteProduct = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM product_master WHERE product_id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

exports.editProduct = async (req, res) => {
  try {
    const { error } = productSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const userId = req.user.id;
    const { product_name, type, category, subCategory, isTaxable, isKeepingStock, savedIn, status } = req.body;

    const [result] = await db.query(
      `UPDATE product_master 
       SET product_name = ?, type = ?, category = ?, subCategory = ?, 
           isTaxable = ?, isKeepingStock = ?, savedBy = ?, savedIn = ?, status = ?
       WHERE product_id = ?`,
      [product_name, type, category, subCategory, isTaxable, isKeepingStock, userId, savedIn, status, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json({ message: 'Product updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};
