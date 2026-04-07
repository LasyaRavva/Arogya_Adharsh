// ...existing code...
const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET /api/products/country/:country_id
router.get('/country/:country_id', async (req, res) => {
  const { country_id } = req.params;
  try {
    // Only return products NOT restricted for this country, include price & currency
    const result = await db.query(
      `
      WITH review_summary AS (
        SELECT
          LOWER(TRIM(product)) AS product_name_key,
          COUNT(*)::int AS review_count,
          AVG(rating)::numeric(10,2) AS avg_rating
        FROM adharsh.reviews
        WHERE approved = true
        GROUP BY LOWER(TRIM(product))
      )
      SELECT DISTINCT ON (p.pro_id) p.*, p.image_1 AS image_url,
             vp.price, vp.currency_code,
             COALESCE(rs.review_count, 0) AS review_count,
             COALESCE(rs.avg_rating, p.rating, 0) AS avg_rating
      FROM adharsh.products p
      INNER JOIN adharsh.product_variants pv ON p.pro_id = pv.product_id
      INNER JOIN adharsh.variant_prices vp ON pv.pro_var_id = vp.product_variant_id
      LEFT JOIN review_summary rs ON rs.product_name_key = LOWER(TRIM(p.name))
      WHERE vp.country_id = $1
        AND NOT EXISTS (
          SELECT 1
          FROM adharsh.product_restrictions r
          WHERE r.product_id = p.pro_id
            AND r.country_id = $1
            AND r.restriction_type = 'HIDE'
        )
      ORDER BY p.pro_id ASC, vp.price ASC
      `,
      [country_id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;