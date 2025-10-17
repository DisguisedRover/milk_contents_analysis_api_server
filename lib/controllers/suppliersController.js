const { response } = require('express');
const db = require('../models/db');
const suppliersSchema = require('../validators/suppliersValidator');

exports.getSuppliers = async (req,res) => {
    try {
        const [rows] =  await db.query("SELECT * FROM suppliers");
        res.json(rows);
    }
    catch (err){
        console.error(err);
        res.status(500).json({ error: "Database Error"});
    }
};

exports.getSuppliersById =  async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM suppliers WHERE supplier_id = ? ", [req.params.id]);
        if (rows.length === 0){
          return res.status(404).json({error: "Supplier not Found" });
        }
        res.json(rows[0]);
    }
    catch (err){
        console.error(err);
        res.status(500).json({error: "Database Error" });
    }
};

exports.saveSuppliers = async (req, res) => {
    try {
        const { error } = suppliersSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const userId = req.user.id;

        const { name, contact_person, email, phone, address, tax_id, payment_terms, is_active } =  req.body;

        const [result] = await db.query(
            `INSERT INTO suppliers
            (name, contact_person, email, phone, address, tax_id, payment_terms, is_active, created_at, savedBy)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
            [name, contact_person, email, phone, address, tax_id, payment_terms, is_active, userId]
        );

        const [newSuppliers] = await db.query(
            `SELECT * FROM suppliers WHERE supplier_id = ?`,
            [result.insertId]
        );

        res.status(201).json(newSuppliers[0]);

    }
    catch (err){
        console.error(err);
        res.status(500).json({error: "Database Error"});
    }
};

exports.deleteSuppliers = async (req, res) => {
    try {
        const [result] = await db.query("DELETE FROM suppliers WHERE supplier_id = ? ", [req.params.id]);
        if (result.affectedRows === 0){
            return res.status(404).json({error: 'Suppliers not found'});
        }
        res.json({ message: "Suppliers deleted successfully"});
    }
    catch (err){
        console.error(err);
        res.status(500).json({ error: "Database Error"});
    }
}

exports.editSuppliers = async (req, res) => {
    try {
        const { error } = suppliersSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message});

        const userId = req.user.id;

        const { name, contact_person, email, phone, address, tax_id, payment_terms, is_active } = req.body;

        const [result] = await db.query(
            `UPDATE suppliers SET 
            name = ?, contact_person = ?, email = ?, phone = ?, address = ?, tax_id = ?, payment_terms = ?, is_active = ?, savedBy = ?, updated_at = NOW() 
            WHERE supplier_id = ?`,
            [name, contact_person, email, phone, address, tax_id, payment_terms, is_active, userId, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Suppliers not found"});
        }

        res.status(200).json({ message: "Suppliers updated successfully"});
    }
    catch (err){
        console.error(err);
        res.status(500).json({ error: "Database Error"});
    }
};