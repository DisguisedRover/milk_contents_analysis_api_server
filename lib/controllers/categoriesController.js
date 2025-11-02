const db = require('../models/db');
const categorySchema = require('../validators/product/categoriesValidator');


exports.getCategories = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM categories');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM categories WHERE category_id = ?', 
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { error } = categorySchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const userId = req.user.id;
    const { name, parent_id, description, is_active } = req.body;

    const [result] = await db.query(
      `INSERT INTO categories 
       (name, parent_id, description, is_active, created_by, updated_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, parent_id, description, is_active, userId, userId]
    );

    const [newCategory] = await db.query(
      'SELECT * FROM categories WHERE category_id = ?',
      [result.insertId]
    );

    res.status(201).json(newCategory[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { error } = categorySchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const userId = req.user.id;
    const { name, parent_id, description, is_active } = req.body;

    const [result] = await db.query(
      `UPDATE categories SET 
       name = ?, parent_id = ?, description = ?, is_active = ?, updated_by = ?
       WHERE category_id = ?`,
      [name, parent_id, description, is_active, userId, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ message: 'Category updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM categories WHERE category_id = ?', 
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

