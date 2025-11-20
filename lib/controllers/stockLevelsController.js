const db = require('../models/db');
const stockLevelsSchema = require('../validators/stock/stockLevelsValidator');

exports.getStockLevels = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM stock_levels');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

exports.getStockLevelById = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM stock_levels WHERE stock_id = ?', 
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Stock level not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

exports.createStockLevel = async (req, res) => {
  try {
    const { error } = stockLevelsSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const userId = req.user.id;
    const { product_id, warehouse_id, min_stock_level, max_stock_level } = req.body;

    const [result] = await db.query(
      `INSERT INTO stock_levels 
       (product_id, warehouse_id, quantity, min_stock_level, max_stock_level, created_by)
       VALUES (?, ?, 0, ?, ?, ?)`,
      [product_id, warehouse_id, min_stock_level, max_stock_level, userId]
    );

    const [newStockLevel] = await db.query(
      'SELECT * FROM stock_levels WHERE stock_id = ?',
      [result.insertId]
    );

    res.status(201).json(newStockLevel[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

exports.updateStockLevel = async (req, res) => {
  try {
    const { error } = stockLevelsSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { product_id, warehouse_id, min_stock_level, max_stock_level } = req.body;

    const [result] = await db.query(
      `UPDATE stock_levels SET 
       product_id = ?, warehouse_id = ?, min_stock_level = ?, max_stock_level = ?
       WHERE stock_id = ?`,
      [product_id, warehouse_id, min_stock_level, max_stock_level, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Stock level not found' });
    }

    res.json({ message: 'Stock level updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

exports.deleteStockLevel = async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM stock_levels WHERE stock_id = ?', 
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Stock level not found' });
    }
    res.json({ message: 'Stock level deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};


// Get low stock items
exports.getLowStockItems = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT sl.*, pm.product_name, w.name as warehouse_name 
       FROM stock_levels sl
       JOIN product_master pm ON sl.product_id = pm.product_id
       JOIN warehouses w ON sl.warehouse_id = w.warehouse_id
       WHERE sl.quantity <= sl.min_stock_level`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

// Get out of stock items
exports.getOutOfStockItems = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT sl.*, pm.product_name, w.name as warehouse_name 
       FROM stock_levels sl
       JOIN product_master pm ON sl.product_id = pm.product_id
       JOIN warehouses w ON sl.warehouse_id = w.warehouse_id
       WHERE sl.quantity = 0`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

// Get stock by warehouse
exports.getStockByWarehouse = async (req, res) => {
  try {
    const warehouseId = req.params.id;
    const [rows] = await db.query(
      `SELECT sl.*, pm.product_name, pm.category 
       FROM stock_levels sl
       JOIN product_master pm ON sl.product_id = pm.product_id
       WHERE sl.warehouse_id = ?`,
      [warehouseId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

// Get stock by product
exports.getStockByProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const [rows] = await db.query(
      `SELECT sl.*, w.name as warehouse_name, w.location 
       FROM stock_levels sl
       JOIN warehouses w ON sl.warehouse_id = w.warehouse_id
       WHERE sl.product_id = ?`,
      [productId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

// Adjust stock manually
exports.adjustStock = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const userId = req.user.id;
    const { product_id, warehouse_id, adjustment_quantity, reason } = req.body;

    // Create stock transaction
    await connection.query(
      `INSERT INTO stock_transactions 
       (product_id, warehouse_id, transaction_type, quantity, reference_type, 
        notes, created_by)
       VALUES (?, ?, "ADJUST", ?, "ADJUSTMENT", ?, ?)`,
      [product_id, warehouse_id, adjustment_quantity, reason, userId]
    );

    // Update stock level
    await connection.query(
      'UPDATE stock_levels SET quantity = quantity + ? WHERE product_id = ? AND warehouse_id = ?',
      [adjustment_quantity, product_id, warehouse_id]
    );

    await connection.commit();
    res.json({ message: 'Stock adjusted successfully' });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  } finally {
    connection.release();
  }
};


// Stock valuation report
exports.getStockValuationReport = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT 
        w.name as warehouse_name,
        pm.product_name,
        pm.category,
        sl.quantity,
        pd.salesRate as unit_price,
        (sl.quantity * pd.salesRate) as total_value
       FROM stock_levels sl
       JOIN product_master pm ON sl.product_id = pm.product_id
       JOIN product_details pd ON pm.product_id = pd.product_id
       JOIN warehouses w ON sl.warehouse_id = w.warehouse_id
       WHERE sl.quantity > 0
       ORDER BY total_value DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};

// Sales summary by date range
exports.getSalesSummary = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const [rows] = await db.query(
      `SELECT 
        DATE(order_date) as date,
        COUNT(*) as total_orders,
        SUM(total_amount) as total_sales,
        SUM(tax_amount) as total_tax,
        SUM(discount_amount) as total_discount
       FROM sales_orders
       WHERE order_date BETWEEN ? AND ?
       AND status != 'CANCELLED'
       GROUP BY DATE(order_date)
       ORDER BY date DESC`,
      [start_date, end_date]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database Error' });
  }
};