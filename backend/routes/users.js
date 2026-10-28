const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');
const { asyncHandler, isNonEmpty } = require('../middleware/validate');

const router = express.Router();
const ROLES = ['admin', 'member'];
const PUBLIC_COLS = 'id, name, membership_id, role, created_at';

// LOGIN (membership ID + password)
router.post('/login', asyncHandler(async (req, res) => {
  const { membership_id, password } = req.body;
  if (!isNonEmpty(membership_id) || !isNonEmpty(password)) {
    return res.status(400).json({ error: 'Membership ID and password are required' });
  }
  const [rows] = await pool.query('SELECT * FROM users WHERE membership_id = ?', [membership_id.trim()]);
  if (!rows.length || !bcrypt.compareSync(password, rows[0].password_hash)) {
    return res.status(401).json({ error: 'Invalid membership ID or password' });
  }
  const { password_hash, ...user } = rows[0];
  res.json(user);
}));

// READ all
router.get('/', asyncHandler(async (req, res) => {
  const [rows] = await pool.query(`SELECT ${PUBLIC_COLS} FROM users ORDER BY name`);
  res.json(rows);
}));

// CREATE
router.post('/', asyncHandler(async (req, res) => {
  const { name, membership_id, role, password } = req.body;
  if (!isNonEmpty(name)) return res.status(400).json({ error: 'Name is required' });
  if (!isNonEmpty(membership_id)) return res.status(400).json({ error: 'Membership ID is required' });
  if (!ROLES.includes(role)) return res.status(400).json({ error: 'Role must be admin or member' });
  if (!isNonEmpty(password) || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  const [result] = await pool.query(
    'INSERT INTO users (name, membership_id, role, password_hash) VALUES (?, ?, ?, ?)',
    [name.trim(), membership_id.trim(), role, bcrypt.hashSync(password, 10)]
  );
  const [rows] = await pool.query(`SELECT ${PUBLIC_COLS} FROM users WHERE id = ?`, [result.insertId]);
  res.status(201).json(rows[0]);
}));

// UPDATE (password optional: only changed if provided)
router.put('/:id', asyncHandler(async (req, res) => {
  const { name, membership_id, role, password } = req.body;
  if (!isNonEmpty(name)) return res.status(400).json({ error: 'Name is required' });
  if (!isNonEmpty(membership_id)) return res.status(400).json({ error: 'Membership ID is required' });
  if (!ROLES.includes(role)) return res.status(400).json({ error: 'Role must be admin or member' });

  let result;
  if (isNonEmpty(password)) {
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    [result] = await pool.query(
      'UPDATE users SET name=?, membership_id=?, role=?, password_hash=? WHERE id=?',
      [name.trim(), membership_id.trim(), role, bcrypt.hashSync(password, 10), req.params.id]
    );
  } else {
    [result] = await pool.query(
      'UPDATE users SET name=?, membership_id=?, role=? WHERE id=?',
      [name.trim(), membership_id.trim(), role, req.params.id]
    );
  }
  if (!result.affectedRows) return res.status(404).json({ error: 'User not found' });
  const [rows] = await pool.query(`SELECT ${PUBLIC_COLS} FROM users WHERE id = ?`, [req.params.id]);
  res.json(rows[0]);
}));

// DELETE
router.delete('/:id', asyncHandler(async (req, res) => {
  const [result] = await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ error: 'User not found' });
  res.json({ message: 'User deleted' });
}));

module.exports = router;
