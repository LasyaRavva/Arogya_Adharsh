const db = require('../config/database');

exports.getAllCategories = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM adharsh.categories');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addCategory = async (req, res) => {
  try {
    const { name, slug, parent_id, image_path } = req.body;
    const result = await db.query(
      `INSERT INTO adharsh.categories (name, slug, parent_id, image_path) VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, slug, parent_id || null, image_path || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCategoryImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { image_path } = req.body;
    if (!image_path) return res.status(400).json({ error: 'No image_path provided' });
    const result = await db.query(
      `UPDATE adharsh.categories SET image_path = $1 WHERE cat_id = $2 RETURNING *`,
      [image_path, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Category not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};