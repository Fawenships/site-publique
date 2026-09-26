const { Pool } = require('pg');
require('dotenv').config();

if (!process.env.DATABASE_URL) {
  console.warn('⚠️  DATABASE_URL manquant dans .env — voir .env.example');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

module.exports = pool;
