const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

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
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const ensureCustomerProfileColumns = async () => {
  await pool.query(`
    ALTER TABLE adharsh.customers
    ADD COLUMN IF NOT EXISTS phone character varying(30)
  `);

  await pool.query(`
    ALTER TABLE adharsh.customer_addresses
    ADD COLUMN IF NOT EXISTS phone character varying(30)
  `);
};

// Sign Up
router.post('/signup', async (req, res) => {
  try {
    await ensureCustomerProfileColumns();
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Check if email already exists
    const emailCheck = await pool.query(
      'SELECT * FROM adharsh.customers WHERE email = $1',
      [email]
    );

    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Insert customer
    const result = await pool.query(
      'INSERT INTO adharsh.customers (name, email, password_hash) VALUES ($1, $2, $3) RETURNING cus_id, name, email, phone, created_at',
      [name, email, password_hash]
    );

    const customer = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { cus_id: customer.cus_id, email: customer.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Account created successfully',
      token,
      customer: {
        cus_id: customer.cus_id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone || '',
        created_at: customer.created_at
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Error creating account' });
  }
});

// Sign In
router.post('/signin', async (req, res) => {
  try {
    await ensureCustomerProfileColumns();
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find customer by email
    const result = await pool.query(
      'SELECT * FROM adharsh.customers WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const customer = result.rows[0];

    // Compare password
    const passwordMatch = await bcrypt.compare(password, customer.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { cus_id: customer.cus_id, email: customer.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Sign in successful',
      token,
      customer: {
        cus_id: customer.cus_id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone || ''
      }
    });
  } catch (error) {
    console.error('Sign in error:', error);
    res.status(500).json({ error: 'Error signing in' });
  }
});

router.get('/me', authenticate, async (req, res) => {
  try {
    await ensureCustomerProfileColumns();

    const result = await pool.query(
      `
      SELECT
        c.cus_id,
        c.name,
        c.email,
        COALESCE(NULLIF(TRIM(c.phone), ''), NULLIF(TRIM(addr.phone), '')) AS phone,
        c.created_at
      FROM adharsh.customers c
      LEFT JOIN LATERAL (
        SELECT ca.phone
        FROM adharsh.customer_addresses ca
        WHERE ca.customer_id = c.cus_id
        ORDER BY ca.is_default DESC, ca.created_at DESC
        LIMIT 1
      ) addr ON true
      WHERE c.cus_id = $1
      LIMIT 1
      `,
      [req.user.cus_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const customer = result.rows[0];

    return res.json({
      customer: {
        cus_id: customer.cus_id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone || '',
        created_at: customer.created_at,
      },
    });
  } catch (error) {
    console.error('Fetch profile error:', error);
    return res.status(500).json({ error: 'Error fetching profile' });
  }
});

router.put('/profile', authenticate, async (req, res) => {
  try {
    await ensureCustomerProfileColumns();

    const name = String(req.body?.name || '').trim();
    const email = String(req.body?.email || '').trim();
    const phone = String(req.body?.phone || '').trim();

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const emailCheck = await pool.query(
      `
      SELECT cus_id
      FROM adharsh.customers
      WHERE email = $1 AND cus_id <> $2
      LIMIT 1
      `,
      [email, req.user.cus_id]
    );

    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const result = await pool.query(
      `
      UPDATE adharsh.customers
      SET name = $1, email = $2, phone = $3
      WHERE cus_id = $4
      RETURNING cus_id, name, email, phone, created_at
      `,
      [name, email, phone, req.user.cus_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    return res.json({
      message: 'Profile updated successfully',
      customer: result.rows[0],
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ error: 'Error updating profile' });
  }
});

// Forgot Password - Reset Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // Validation
    if (!email || !newPassword) {
      return res.status(400).json({ error: 'Email and new password are required' });
    }

    // Find customer by email
    const result = await pool.query(
      'SELECT cus_id FROM adharsh.customers WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Email not found' });
    }

    // Hash new password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await pool.query(
      'UPDATE adharsh.customers SET password_hash = $1 WHERE email = $2',
      [password_hash, email]
    );

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Error resetting password' });
  }
});

module.exports = router;
