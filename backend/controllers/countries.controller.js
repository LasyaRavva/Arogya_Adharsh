const db = require('../config/database');

exports.getCountries = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT country_id, code, name, currency_code
      FROM adharsh.countries
      WHERE is_active = true
      ORDER BY name ASC
    `);

    res.json(result.rows);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};