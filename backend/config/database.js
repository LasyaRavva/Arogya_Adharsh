const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || '156.67.104.162',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'adha',
  user: process.env.DB_USER || 'adharsh',
  password: process.env.DB_PASSWORD || 'Adharsh@123',
    max: 10, // Limit pool size to 10 connections
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

module.exports = pool;
