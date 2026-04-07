const express = require("express");
const router = express.Router();
const pool = require("../config/database");

// POST testimonial
router.post("/", async (req, res) => {
  try {
    const { name, description, rating, product_id } = req.body;
    if (!product_id) {
      return res.status(400).json({ error: "product_id is required" });
    }
    // Check if product exists
    const productCheck = await pool.query(
      'SELECT * FROM adharsh.products WHERE pro_id = $1',
      [product_id]
    );
    if (productCheck.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    const result = await pool.query(
      `INSERT INTO adharsh.testimonials (name, description, rating, product_id)
       VALUES ($1,$2,$3,$4)
       RETURNING *`,
      [name, description, rating, product_id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET testimonials
router.get("/", async (req, res) => {
  try {
    const { product_id } = req.query;
    let result;
    if (product_id) {
      result = await pool.query(
        "SELECT * FROM adharsh.testimonials WHERE product_id = $1 ORDER BY created_at DESC",
        [product_id]
      );
    } else {
      result = await pool.query(
        "SELECT * FROM adharsh.testimonials ORDER BY created_at DESC"
      );
    }
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;