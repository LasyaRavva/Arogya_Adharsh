const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const router = express.Router();

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization token required' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// GET /api/wishlists?country_id=X
// Returns all wishlist items for the logged-in customer with product details and price
router.get('/', authenticate, async (req, res) => {
  try {
    const customerId = req.user.cus_id;
    const countryId = req.query.country_id ? parseInt(req.query.country_id) : null;

    const result = await db.query(
      `SELECT
         w.wishlist_id,
         w.product_id,
         p.name,
         p.image_1 AS image_url,
         COALESCE(
           (
             SELECT vp.price
             FROM adharsh.product_variants pv
             JOIN adharsh.variant_prices vp ON pv.pro_var_id = vp.product_variant_id
             WHERE pv.product_id = p.pro_id
               AND ($2::int IS NULL OR vp.country_id = $2::int)
             ORDER BY vp.price ASC
             LIMIT 1
           ),
           0
         ) AS price,
         COALESCE(
           (SELECT cc.currency_code FROM adharsh.countries cc WHERE cc.country_id = $2::int LIMIT 1),
           'INR'
         ) AS currency_code,
         w.created_at
       FROM adharsh.wishlists w
       JOIN adharsh.products p ON w.product_id = p.pro_id
       WHERE w.customer_id = $1
       ORDER BY w.created_at DESC`,
      [customerId, countryId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/wishlists/:product_id
// Add a product to the wishlist
router.post('/:product_id', authenticate, async (req, res) => {
  try {
    const customerId = req.user.cus_id;
    const productId = parseInt(req.params.product_id);

    if (isNaN(productId)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const productCheck = await db.query(
      'SELECT pro_id FROM adharsh.products WHERE pro_id = $1',
      [productId]
    );
    if (productCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const result = await db.query(
      `INSERT INTO adharsh.wishlists (customer_id, product_id)
       VALUES ($1, $2)
       ON CONFLICT (customer_id, product_id) DO NOTHING
       RETURNING wishlist_id`,
      [customerId, productId]
    );

    if (result.rows.length === 0) {
      // Already existed (conflict, DO NOTHING)
      return res.status(200).json({ message: 'Already in wishlist' });
    }

    res.status(201).json({ message: 'Added to wishlist', wishlist_id: result.rows[0].wishlist_id });
  } catch (error) {
    console.error('Add wishlist error:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/wishlists/:product_id
// Remove a specific product from the wishlist
router.delete('/:product_id', authenticate, async (req, res) => {
  try {
    const customerId = req.user.cus_id;
    const productId = parseInt(req.params.product_id);

    if (isNaN(productId)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    await db.query(
      'DELETE FROM adharsh.wishlists WHERE customer_id = $1 AND product_id = $2',
      [customerId, productId]
    );

    res.json({ message: 'Removed from wishlist' });
  } catch (error) {
    console.error('Remove wishlist error:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/wishlists
// Clear the entire wishlist for the logged-in customer
router.delete('/', authenticate, async (req, res) => {
  try {
    const customerId = req.user.cus_id;
    await db.query('DELETE FROM adharsh.wishlists WHERE customer_id = $1', [customerId]);
    res.json({ message: 'Wishlist cleared' });
  } catch (error) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
