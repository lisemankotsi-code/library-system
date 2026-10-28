const express = require('express');
const pool = require('../db');
const { asyncHandler, isPosInt } = require('../middleware/validate');

const router = express.Router();

// READ history (newest first)
router.get('/', asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT t.id, t.book_id, t.user_id, t.type, t.quantity, t.created_at,
            b.title AS book_title, u.name AS user_name, u.membership_id
       FROM transactions t
       JOIN books b ON b.id = t.book_id
  LEFT JOIN users u ON u.id = t.user_id
   ORDER BY t.created_at DESC, t.id DESC`
  );
  res.json(rows);
}));

// CREATE: ADD_STOCK increases quantity, BORROW decreases it
router.post('/', asyncHandler(async (req, res) => {
  const { book_id, user_id, type, quantity } = req.body;
  if (!['ADD_STOCK', 'BORROW'].includes(type)) {
    return res.status(400).json({ error: 'Type must be ADD_STOCK or BORROW' });
  }
  if (!isPosInt(book_id)) return res.status(400).json({ error: 'Please select a book' });
  if (!isPosInt(quantity)) return res.status(400).json({ error: 'Quantity must be a whole number greater than 0' });
  if (type === 'BORROW' && !isPosInt(user_id)) {
    return res.status(400).json({ error: 'Please select the user borrowing the book' });
  }

  const qty = Number(quantity);
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    // Lock the row so concurrent requests can't oversell stock
    const [books] = await conn.query('SELECT quantity FROM books WHERE id = ? FOR UPDATE', [book_id]);
    if (!books.length) {
      await conn.rollback();
      return res.status(404).json({ error: 'Book not found' });
    }
    if (type === 'BORROW' && books[0].quantity < qty) {
      await conn.rollback();
      return res.status(400).json({ error: `Insufficient stock: only ${books[0].quantity} available` });
    }
    const delta = type === 'ADD_STOCK' ? qty : -qty;
    await conn.query('UPDATE books SET quantity = quantity + ? WHERE id = ?', [delta, book_id]);
    const [result] = await conn.query(
      'INSERT INTO transactions (book_id, user_id, type, quantity) VALUES (?, ?, ?, ?)',
      [book_id, type === 'BORROW' ? user_id : (user_id || null), type, qty]
    );
    await conn.commit();
    res.status(201).json({ id: result.insertId, message: 'Transaction recorded' });
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}));

module.exports = router;
