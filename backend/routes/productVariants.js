const express = require('express');
const router = express.Router();
const db = require('../config/database'); // adjust path if needed

// GET all variants for a product
router.get('/:product_id', async (req, res) => {
  const { product_id } = req.params;
  try {
    const result = await db.query(
    //   'SELECT * FROM adharsh.product_variants WHERE product_id = $1 ORDER BY pro_var_id ASC',
    `SELECT v.*, COALESCE(p.stocks, 0) AS available_stock, COALESCE(p.stocks, 0) AS product_stock, c.name AS category_name
       FROM adharsh.product_variants v
       JOIN adharsh.products p ON v.product_id = p.pro_id
       JOIN adharsh.categories c ON p.category_id = c.cat_id
       WHERE v.product_id = $1
       ORDER BY v.pro_var_id ASC`,
      [product_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;