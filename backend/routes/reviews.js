const express = require('express');
const router = express.Router();
const pool = require('../config/database');

router.get('/', async (req, res) => {
  try {
    console.log('Reviews route hit - trying to fetch from adharsh.reviews');

    const result = await pool.query(`
      SELECT 
        id,
        name AS customer,
        rating,
        comment,
        product,
        approved,
        created_at
      FROM adharsh.reviews
      WHERE approved = true
      ORDER BY created_at DESC
    `);

    console.log('Query success - rows found:', result.rowCount);
    res.json(result.rows);
  } catch (err) {
    console.error('REVIEWS ROUTE CRASH:', err.message);
    res.status(500).json({ error: 'Failed to load reviews' });
  }
});

module.exports = router;