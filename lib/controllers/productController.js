const { response } = require('express');
const db = require('../models/db');
const productSchema = require('../validators/productValidator');

exports.getProduct = async (req, res) => {
    try{
       const [rows] =  await db.query('SELECT * FROM product');
       res.json(rows);
    }catch (err){
        console.error(err);
        res.status(500).json({error: 'Database Error'});
    }
}

exports.getProductById = async (req, res) => {
    try{
        const [rows] = await db.query('SELECT * FROM product WHERE productID = ?', [req.params.id]);
        if(rows.length === 0){
          
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(rows[0]);
    }catch (err){
        console.error(err);
        res.status(500).json({error:'Database Error'});
    }
}

exports.saveProduct = async (req, res) => {
    try {
        const { error } = productSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const { productName, type, category, subCategory, isTaxable, 
               isKeepingStock, savedBy, savedIn, status } = req.body;

        const [result] = await db.query(
            `INSERT INTO product 
             (productName, type, category, subCategory, isTaxable, 
              isKeepingStock, savedBy, savedIn, status)
             VALUES (?,?,?,?,?,?,?,?,?)`, 
            [productName, type, category, subCategory || null, 
             isTaxable, isKeepingStock, savedBy, savedIn, status]
        );

        const [newProduct] = await db.query(
            'SELECT * FROM product WHERE productId = ?', 
            [result.insertId]
        );

        res.status(201).json(newProduct[0]);
    } catch (err) {
        console.error('Database Error:', err);
        res.status(500).json({ error: 'Database operation failed' });
    }
}
exports.deleteProduct = async (req, res) => {
    try{
        const [result] = await db.query('DELETE FROM product WHERE productId = ?',[req.params.id]);
        if (result.affectedRows === 0){
            return res.status(404).json({error: 'Product not found'});
        }
        res.json({message: 'Product deleted successfully'}); 
    }catch (err){
        console.error(err);
        res.status(500).json({error: 'Database Error'});
    }
}

exports.editProduct = async (req, res) => {
    try{
        const {error} = productSchema.validate(req.body);
        if(error) return res.status(400).json({error: error.details[0].message});

         const {
            productName, type, category, subCategory, isTaxable, isKeepingStock, savedBy, savedIn, status
        } = req.body;

        const [rows] = await db.query(`UPDATE product SET productName = ?, type = ?, category = ?, subCategory = ?, isTaxable = ?, isKeepingStock = ?, savedBy = ?, SavedIn = ?, status = ? WHERE productId = ?`,
            [productName, type, category, subCategory, isTaxable, isKeepingStock, savedBy, savedIn, status]); 
        res.status(201).json({ prodDetailID: result.insertId, message: 'Product Updated' });
    }catch(err){
        console.error(err);
        res.status(500).json({error: 'Database Error'});
    }
}