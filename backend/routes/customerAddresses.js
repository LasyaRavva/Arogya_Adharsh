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
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const ensureAddressColumns = async () => {
  await db.query(`
    ALTER TABLE adharsh.customer_addresses
    ADD COLUMN IF NOT EXISTS first_name character varying(100),
    ADD COLUMN IF NOT EXISTS last_name character varying(100),
    ADD COLUMN IF NOT EXISTS company_name character varying(255),
    ADD COLUMN IF NOT EXISTS email character varying(255),
    ADD COLUMN IF NOT EXISTS phone character varying(30)
  `);
};

const resolveCountryId = async (countryId, countryName) => {
  if (countryId) {
    const parsedId = Number(countryId);
    if (!Number.isNaN(parsedId)) {
      const checkById = await db.query(
        `SELECT country_id FROM adharsh.countries WHERE country_id = $1`,
        [parsedId]
      );
      if (checkById.rows.length > 0) return parsedId;
    }
  }

  if (!countryName || !String(countryName).trim()) return null;

  const lookup = await db.query(
    `
    SELECT country_id
    FROM adharsh.countries
    WHERE LOWER(name) = LOWER($1) OR LOWER(code) = LOWER($1)
    LIMIT 1
    `,
    [String(countryName).trim()]
  );

  return lookup.rows[0]?.country_id || null;
};

const normalizeRequiredAddressFields = (payload = {}) => {
  const normalized = {
    first_name: String(payload.first_name || '').trim(),
    last_name: String(payload.last_name || '').trim(),
    company_name: String(payload.company_name || '').trim(),
    address_line1: String(payload.address_line1 || '').trim(),
    address_line2: String(payload.address_line2 || '').trim(),
    city: String(payload.city || '').trim(),
    state: String(payload.state || '').trim(),
    postal_code: String(payload.postal_code || '').trim(),
    country: String(payload.country || '').trim(),
    email: String(payload.email || '').trim(),
    phone: String(payload.phone || '').trim(),
  };

  const requiredKeys = [
    'first_name',
    'last_name',
    'company_name',
    'address_line1',
    'address_line2',
    'city',
    'state',
    'postal_code',
    'country',
    'email',
    'phone',
  ];

  const missing = requiredKeys.filter((key) => !normalized[key]);
  return { normalized, missing };
};

router.get('/my', authenticate, async (req, res) => {
  const customerId = req.user?.cus_id;

  if (!customerId) {
    return res.status(401).json({ error: 'Customer identity missing in token' });
  }

  try {
    await ensureAddressColumns();

    const result = await db.query(
      `
      SELECT
        ca.address_id,
        ca.customer_id,
        ca.country_id,
        c.name AS country_name,
        c.code AS country_code,
        ca.address_line1,
        ca.address_line2,
        ca.city,
        ca.state,
        ca.postal_code,
        ca.is_default,
        ca.first_name,
        ca.last_name,
        ca.company_name,
        ca.email,
        ca.phone,
        ca.created_at
      FROM adharsh.customer_addresses ca
      LEFT JOIN adharsh.countries c ON c.country_id = ca.country_id
      WHERE ca.customer_id = $1
      ORDER BY ca.is_default DESC, ca.created_at DESC
      `,
      [customerId]
    );

    return res.json(result.rows);
  } catch (error) {
    console.error('Fetch customer addresses error:', error);
    return res.status(500).json({ error: 'Failed to fetch addresses' });
  }
});

router.post('/', authenticate, async (req, res) => {
  const customerId = req.user?.cus_id;
  const {
    country_id,
    country,
    address_line1,
    address_line2 = null,
    city = null,
    state = null,
    postal_code = null,
    is_default = false,
    first_name = null,
    last_name = null,
    company_name = null,
    email = null,
    phone = null,
  } = req.body;

  const { normalized, missing } = normalizeRequiredAddressFields({
    first_name,
    last_name,
    company_name,
    address_line1,
    address_line2,
    city,
    state,
    postal_code,
    country,
    email,
    phone,
  });

  if (!customerId) {
    return res.status(401).json({ error: 'Customer identity missing in token' });
  }

  if (missing.length > 0) {
    return res.status(400).json({
      error: `All fields are required. Missing: ${missing.join(', ')}`,
    });
  }

  try {
    await ensureAddressColumns();

    const resolvedCountryId = await resolveCountryId(country_id, normalized.country);
    if (!resolvedCountryId) {
      return res.status(400).json({ error: 'Valid country or country_id is required' });
    }

    const client = await db.connect();

    try {
      await client.query('BEGIN');

      if (is_default) {
        await client.query(
          `UPDATE adharsh.customer_addresses SET is_default = false WHERE customer_id = $1`,
          [customerId]
        );
      }

      const result = await client.query(
        `
        INSERT INTO adharsh.customer_addresses (
          customer_id,
          country_id,
          address_line1,
          address_line2,
          city,
          state,
          postal_code,
          is_default,
          first_name,
          last_name,
          company_name,
          email,
          phone
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING address_id, customer_id, country_id, address_line1, address_line2, city, state, postal_code, is_default, first_name, last_name, company_name, email, phone, created_at
        `,
        [
          customerId,
          resolvedCountryId,
          normalized.address_line1,
          normalized.address_line2,
          normalized.city,
          normalized.state,
          normalized.postal_code,
          Boolean(is_default),
          normalized.first_name,
          normalized.last_name,
          normalized.company_name,
          normalized.email,
          normalized.phone,
        ]
      );

      await client.query('COMMIT');
      return res.status(201).json(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Create address error:', error);
    return res.status(500).json({ error: 'Failed to create address' });
  }
});

router.put('/:address_id', authenticate, async (req, res) => {
  const customerId = req.user?.cus_id;
  const { address_id } = req.params;
  const {
    country_id,
    country,
    address_line1,
    address_line2 = null,
    city = null,
    state = null,
    postal_code = null,
    is_default = false,
    first_name = null,
    last_name = null,
    company_name = null,
    email = null,
    phone = null,
  } = req.body;

  const { normalized, missing } = normalizeRequiredAddressFields({
    first_name,
    last_name,
    company_name,
    address_line1,
    address_line2,
    city,
    state,
    postal_code,
    country,
    email,
    phone,
  });

  if (!customerId) {
    return res.status(401).json({ error: 'Customer identity missing in token' });
  }

  if (missing.length > 0) {
    return res.status(400).json({
      error: `All fields are required. Missing: ${missing.join(', ')}`,
    });
  }

  try {
    await ensureAddressColumns();

    const resolvedCountryId = await resolveCountryId(country_id, normalized.country);
    if (!resolvedCountryId) {
      return res.status(400).json({ error: 'Valid country or country_id is required' });
    }

    const client = await db.connect();

    try {
      await client.query('BEGIN');

      if (is_default) {
        await client.query(
          `UPDATE adharsh.customer_addresses SET is_default = false WHERE customer_id = $1`,
          [customerId]
        );
      }

      const result = await client.query(
        `
        UPDATE adharsh.customer_addresses
        SET
          country_id = $1,
          address_line1 = $2,
          address_line2 = $3,
          city = $4,
          state = $5,
          postal_code = $6,
          is_default = $7,
          first_name = $8,
          last_name = $9,
          company_name = $10,
          email = $11,
          phone = $12
        WHERE address_id = $13 AND customer_id = $14
        RETURNING address_id, customer_id, country_id, address_line1, address_line2, city, state, postal_code, is_default, first_name, last_name, company_name, email, phone, created_at
        `,
        [
          resolvedCountryId,
          normalized.address_line1,
          normalized.address_line2,
          normalized.city,
          normalized.state,
          normalized.postal_code,
          Boolean(is_default),
          normalized.first_name,
          normalized.last_name,
          normalized.company_name,
          normalized.email,
          normalized.phone,
          address_id,
          customerId,
        ]
      );

      if (result.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Address not found' });
      }

      await client.query('COMMIT');
      return res.json(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Update address error:', error);
    return res.status(500).json({ error: 'Failed to update address' });
  }
});

router.delete('/:address_id', authenticate, async (req, res) => {
  const customerId = req.user?.cus_id;
  const { address_id } = req.params;

  if (!customerId) {
    return res.status(401).json({ error: 'Customer identity missing in token' });
  }

  try {
    const result = await db.query(
      `
      DELETE FROM adharsh.customer_addresses
      WHERE address_id = $1 AND customer_id = $2
      RETURNING address_id
      `,
      [address_id, customerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Address not found' });
    }

    return res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Delete address error:', error);
    return res.status(500).json({ error: 'Failed to delete address' });
  }
});

module.exports = router;