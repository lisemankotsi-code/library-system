const express = require('express');
const pool = require('../db');
const { asyncHandler, isNonEmpty, isNonNegInt } = require('../middleware/validate');

const router = express.Router();

function validateBook(b) {
  if (!isNonEmpty(b.title)) return 'Title is required';
  if (!isNonEmpty(b.author)) return 'Author is required';
  if (!isNonEmpty(b.genre)) return 'Genre is required';
  if (!isNonEmpty(b.isbn)) return 'ISBN is required';
  if (!isNonNegInt(b.quantity)) return 'Quantity must be a whole number (0 or more)';
  return null;
}

// READ all
router.get('/', asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM books ORDER BY title');
  res.json(rows);
}));

// READ one
router.get('/:id', asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM books WHERE id = ?', [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: 'Book not found' });
  res.json(rows[0]);
}));

// CREATE
router.post('/', asyncHandler(async (req, res) => {
  const err = validateBook(req.body);
  if (err) return res.status(400).json({ error: err });
  const { title, author, genre, isbn, quantity } = req.body;
  const [result] = await pool.query(
    'INSERT INTO books (title, author, genre, isbn, quantity) VALUES (?, ?, ?, ?, ?)',
    [title.trim(), author.trim(), genre.trim(), isbn.trim(), Number(quantity)]
  );
  // An initial quantity counts as the first stock record
  if (Number(quantity) > 0) {
    await pool.query(
      "INSERT INTO transactions (book_id, user_id, type, quantity) VALUES (?, NULL, 'ADD_STOCK', ?)",
      [result.insertId, Number(quantity)]
    );
  }
  const [rows] = await pool.query('SELECT * FROM books WHERE id = ?', [result.insertId]);
  res.status(201).json(rows[0]);
}));

// UPDATE (details; stock changes go through /transactions)
router.put('/:id', asyncHandler(async (req, res) => {
  const err = validateBook(req.body);
  if (err) return res.status(400).json({ error: err });
  const { title, author, genre, isbn, quantity } = req.body;
  const [result] = await pool.query(
    'UPDATE books SET title=?, author=?, genre=?, isbn=?, quantity=? WHERE id=?',
    [title.trim(), author.trim(), genre.trim(), isbn.trim(), Number(quantity), req.params.id]
  );
  if (!result.affectedRows) return res.status(404).json({ error: 'Book not found' });
  const [rows] = await pool.query('SELECT * FROM books WHERE id = ?', [req.params.id]);
  res.json(rows[0]);
}));

// DELETE
router.delete('/:id', asyncHandler(async (req, res) => {
  const [result] = await pool.query('DELETE FROM books WHERE id = ?', [req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ error: 'Book not found' });
  res.json({ message: 'Book deleted' });
}));

module.exports = router;
