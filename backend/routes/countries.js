const express = require("express");
const router = express.Router();
const db = require("../config/database");

router.get("/", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT country_id, code, name, currency_code FROM adharsh.countries WHERE is_active = true"
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;