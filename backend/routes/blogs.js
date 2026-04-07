const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// POST /api/blogs - Create blog with base64 image text fields
router.post('/', async (req, res) => {
  try {
    const {
      title,
      subtitle,
      description,
      authorname,
      category,
      image1,
      image2,
      image3,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO adharsh.blogs (title, subtitle, description, authorname, category, image1, image2, image3)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        title,
        subtitle || null,
        description || null,
        authorname || null,
        category || null,
        image1 || null,
        image2 || null,
        image3 || null,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET all blogs (newest first)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        title,
        subtitle,
        description,
        authorname,
        image1,
        image2,
        image3,
        created_at
      FROM adharsh.blogs
      ORDER BY created_at DESC
      LIMIT 12
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});


// GET single blog
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT * FROM adharsh.blogs WHERE id = $1
    `, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});


module.exports = router;