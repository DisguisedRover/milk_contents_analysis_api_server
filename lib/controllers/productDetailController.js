const db = require('../models/db');
const productDetailSchema = require('../validators/product/productDetailValidator');

exports.getAllProductDetail = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM product_details');
    res.json({
      success: true,
      message: 'Product details fethed successfully',
      productDetails: rows});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

exports.getProductDetailById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM product_details WHERE detail_id = ? AND deleted_at IS NULL', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product detail not found' });
    }
    res.json({
      success: true,
      message: 'Product detail fetched successfully',
      productDetails: rows[0]});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

exports.getProductDetailByProductId = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT 
         pd.*,
         pm.product_name,
         u.username as saved_by_username
       FROM product_details pd
       JOIN product_master pm ON pd.product_id = pm.product_id
       JOIN users u ON pd.savedBy = u.id
       WHERE pd.product_id = ? AND pd.deleted_at IS NULL`, 
      [req.params.productId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product detail not found for this product' });
    }
    
    res.json({
      success: true,
      message: 'Product detail fetched successfully',
      productDetails: rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

exports.saveProductDetail = async (req, res) => {
  try {
    const { error } = productDetailSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const userId = req.user.id;
    const {
      product_id, baseUnit, derivedUnit, deriveFormula,
      dimension, salesRate, fatRate, rateAffectsDate,
      openingStock, stockDate, savedIn, flavour
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO product_details (product_id, baseUnit, derivedUnit, deriveFormula, dimension, salesRate, fatRate, rateAffectsDate, openingStock, stockDate, savedBy, savedIn, flavour, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [product_id, baseUnit, derivedUnit, deriveFormula, dimension, salesRate, fatRate, rateAffectsDate, openingStock, stockDate, userId, savedIn, flavour]
    );

    const [newProduct] = await db.query(
      'SELECT * FROM product_details WHERE detail_id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Product detail created successfully',
      productDetails: newProduct[0]});
  } catch (err) {
    console.error('Database Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

exports.updateProductDetail = async (req, res) => {
  try {
    const { error } = productDetailSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const detail_id = req.params.id;
    const userId = req.user.id;

    const {
      product_id, baseUnit, derivedUnit, deriveFormula,
      dimension, salesRate, fatRate, rateAffectsDate,
      openingStock, stockDate, savedIn, flavour
    } = req.body;

    const [result] = await db.query(
      `UPDATE product_details SET 
       product_id = ?, baseUnit = ?, derivedUnit = ?, deriveFormula = ?, dimension = ?, salesRate = ?, fatRate = ?, rateAffectsDate = ?, openingStock = ?, stockDate = ?, savedBy = ?, savedIn = ?, flavour = ?, updated_at = NOW()
       WHERE detail_id = ?`,
      [product_id, baseUnit, derivedUnit, deriveFormula, dimension, salesRate, fatRate, rateAffectsDate, openingStock, stockDate, userId, savedIn, flavour, detail_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product detail not found' });
    }

    res.status(200).json({ 
      success: true,
      message: 'Product detail updated successfully',
      detail_id: detail_id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

// exports.deleteProductDetail = async (req, res) => {
//   try {
//     const [result] = await db.query('DELETE FROM product_details WHERE detail_id = ?', [req.params.id]);
//     if (result.affectedRows === 0) {
//       return res.status(404).json({ error: 'Product detail not found' });
//     }
//     res.json({ message: 'Product detail deleted successfully' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Database error' });
//   }
// };


exports.deleteProductDetail = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [result] = await db.query(
      'UPDATE product_details SET deleted_at = NOW(), deleted_by = ? WHERE detail_id = ?',
      [userId, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product detail not found' });
    }

    res.json({ 
      success: true,
      message: 'Product detail deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};