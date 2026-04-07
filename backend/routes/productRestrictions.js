const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET /api/product_restrictions?country_id=4
router.get('/', async (req, res) => {
  const { country_id } = req.query;
  if (!country_id) return res.status(400).json({ error: 'country_id required' });

  try {
    const result = await db.query(
      `SELECT product_id, restriction_type
       FROM adharsh.product_restrictions
       WHERE country_id = $1`,
      [country_id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;