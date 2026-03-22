import dotenv from 'dotenv';
dotenv.config(); // 🔥 MUST be FIRST

import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: String(process.env.DB_PASSWORD), // 🔥 force string
  port: Number(process.env.DB_PORT),
});

export default pool;