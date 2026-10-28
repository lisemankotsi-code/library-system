// Runs schema.sql then inserts sample data. Usage: npm run seed
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  });
  const dbName = process.env.DB_NAME || 'library_db';
  // Hosted providers give you a ready-made database, so creating one may be refused
  try { await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``); } catch (e) { console.log('Skipping CREATE DATABASE:', e.message); }
  await conn.query(`USE \`${dbName}\``);
  let sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  sql = sql.split('\n').filter((l) => !/^(CREATE DATABASE|USE) /i.test(l)).join('\n');
  await conn.query(sql);

  const [[{ n }]] = await conn.query('SELECT COUNT(*) AS n FROM users');
  if (n === 0) {
    await conn.query(
      'INSERT INTO users (name, membership_id, role, password_hash) VALUES ?',
      [[
        ['Admin User', 'ADMIN001', 'admin', bcrypt.hashSync('admin123', 10)],
        ['Thabo Member', 'MEM001', 'member', bcrypt.hashSync('member123', 10)],
      ]]
    );
    await conn.query(
      'INSERT INTO books (title, author, genre, isbn, quantity) VALUES ?',
      [[
        ['Things Fall Apart', 'Chinua Achebe', 'Fiction', '9780385474542', 5],
        ['Clean Code', 'Robert C. Martin', 'Technology', '9780132350884', 1],
        ['Sapiens', 'Yuval Noah Harari', 'History', '9780062316097', 3],
        ['Atomic Habits', 'James Clear', 'Self-help', '9780735211292', 0],
      ]]
    );
    console.log('Sample data inserted.');
  }
  console.log('Database ready. Login: ADMIN001 / admin123');
  await conn.end();
})().catch((e) => { console.error(e); process.exit(1); });
