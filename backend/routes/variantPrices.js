const express = require('express');
const router = express.Router();
const db = require('../config/database'); // adjust path if needed

// GET all prices for a product variant
router.get('/:product_variant_id', async (req, res) => {
  const { product_variant_id } = req.params;
  try {
    const result = await db.query(
      'SELECT * FROM adharsh.variant_prices WHERE product_variant_id = $1 ORDER BY var_pri_id ASC',
      [product_variant_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;