const { response } = require('express');
const db = require('../models/db');
const warehousesSchema = require('../validators/warehousesValidator');

exports.getWarehouses =  async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM warehouses");
        res.json({
            success: true,
            message: "Warehouses fetched successfully",
            warehouses: rows});
    }
    catch (err){
        console.error(err);
        res.status(500).joson({ error: "Database Error"});
    }
};

exports.getWarehouseById = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM warehouses WHERE warehouse_id = ? ", [req.params.id]);
        if (rows.length === 0){
             return res.status(404).json({ error: "Warehouse not Found"});
             }
             res.json({
                success: true,
                message: "Warehouses fetched successfully",
                warehouses: rows[0]});
        }
    catch (err){
        console.error(err);
        res.status(500).json({
            error: "Database Error"});
    }
}

exports.saveWarehouses = async (req, res) => {
    try {
        const { error } = warehousesSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.detains[0].message});

        const userId = req.user.id;

        const { name, location, capacity, manager_id, is_active } = req.body;

        const [result] =await db.query(
            `INSERT INTO warehouses
            (name, location, capacity, manager_id, is_active,created_at, savedBy)
            VALUES (?, ?, ?, ?, ?, NOW(), ?)`,
            [name, location, capacity, manager_id, is_active, userId]
        );

        const [newWarehouse] = await db.query(
            `SELECT * FROM warehouses WHERE warehouse_id = ?`,
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: "Warehouse created successfully",
            warehouses: newWarehouse[0]});
    }
    catch (err){
        console.error(err);
        res.status(500).json({ error: "Database Error"});
    }
};

exports.deleteWarehouses = async (req, res) => {
    try {
        const [result] = await db.query("DELETE FROM warehouses WHERE warehouse_id = ? ", [req.params.id]);
        if (result.affectedRows === 0){
            return res.status(404).json ({ error: "Warehouse not Found"});
        }
        res.json({
            success: true, 
            message: "Warehouse Deleted Successfully"});
    }
    catch (err){
        console.error(err);
        res.status(500).json({ error: "Database Error"});
    }
};

exports.editWarehouses = async (req, res) => {
    try {
        const { error } = warehousesSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message});

        const userId = req.user.id;

        const { name, location, capacity, manager_id, is_active } = req.body;

        const [result] = await db.query(
            `UPDATE warehouses SET
            name = ?, location = ?,  capacity = ?, manager_id = ?, is_active = ?,savedBy = ?, updated_at = NOW()
            WHERE wharehouse_id = ?`,
            [name, location, capacity, manager_id, is_active, userId, req.params.id]
        );

        if (result.affectedRows === 0){
            return res.status(404).json({ error: "Warehouse not found"});
        }
        res.status(200).json({
            success: true,
            message: "Warehouse upadted successfully"});
    }
    catch (err){
        console.error(err);
        res.status(500).json({ error: "Database Error"});
    }
};
