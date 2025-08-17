const db = require('../models/db');
const productDetailSchema = require('../validators/productDetailValidator');

exports.getAllProductDetail = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM productDetail');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

exports.getProductDetailById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM productDetail WHERE prodDetailID = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product detail not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

exports.saveProductDetail = async (req, res) => {
 
  try {
    const { error } = productDetailSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const {
      productName, baseUnit, derivedUnit, deriveFormula,
      dimension, salesRate, fatRate, rateAffectsDate,
      openingStock, stockDate, savedBy, savedIn, flavour
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO productDetail 
      (productName, baseUnit, derivedUnit, deriveFormula, dimension, salesRate, fatRate, rateAffectsDate, openingStock, stockDate, savedBy, savedIn, flavour)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [productName, baseUnit, derivedUnit, deriveFormula, dimension, salesRate, fatRate, rateAffectsDate, openingStock, stockDate, savedBy, savedIn, flavour]
    );


     const [newProduct] = await db.query(
       'SELECT * FROM productDetail WHERE productId = ?', 
        [result.insertId]
      );

        res.status(201).json(newProduct[0]);  } catch (err) {

    console.error('Database Error:',err);
    res.status(500).json({ error: 'Database error' });
  }
};

exports.updateProductDetail = async (req, res) => {
 
  try{
    const { error } = productDetailSchema.validate(req.body);
    if (error) return res.status(400).json({error: error.details[0].message});

   const {
      productName, baseUnit, derivedUnit, deriveFormula,
      dimension, salesRate, fatRate, rateAffectsDate,
      openingStock, stockDate, savedBy, savedIn, flavour
    } = req.body;

    const [result] = await db.query(
      `UPDATE productDetail SET 
      productName = ?, baseUnit = ?, derivedUnit = ?, deriveFormula = ?, dimension = ?, salesRate = ?, fatRate = ?, rateAffectsDate = ?, openingStock = ?, stockDate = ?, savedBy = ?, savedIn = ?, flavour = ?
      WHERE prodDetailID = ?`,
      [productName, baseUnit, derivedUnit, deriveFormula, dimension, salesRate, fatRate, rateAffectsDate, openingStock, stockDate, savedBy, savedIn, flavour, id]
    );
    res.status(201).json({ prodDetailID: result.insertId, message: 'Product detail Updated' });
  }catch (err){
    console.error(err);
    res.status(500).json({error: 'Database error'});
  }
};

exports.deleteProductDetail = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM productDetail WHERE prodDetailID = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product detail not found' });
    }

    res.json({ message: 'Product detail deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};
