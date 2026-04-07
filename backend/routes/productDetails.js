// routes/productDetails.js
const express = require('express');
const router = express.Router();
const db = require('../config/database');


console.log("Loaded productDetails route file");

router.get('/:variant_id', async (req, res) => {
     console.log("HIT product_details route", req.params.variant_id, req.query.country_id);
  const { variant_id } = req.params;
  const { country_id } = req.query;
  try {
    const result = await db.query(
      `SELECT
        p.name AS product_name,
        p.description,
        p.video_url,
        p.image_1,
        p.image_2,
        p.image_3,
        c.name AS category_name,
        v.sku,
        vp.price,
        vp.currency_code
      FROM adharsh.product_variants v
      JOIN adharsh.products p ON v.product_id = p.pro_id
      JOIN adharsh.categories c ON p.category_id = c.cat_id
      LEFT JOIN adharsh.variant_prices vp
        ON vp.product_variant_id = v.pro_var_id
        AND vp.country_id = $2
      WHERE v.pro_var_id = $1`,
      [variant_id, country_id]
    );
    console.log('Query result:', result.rows);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;