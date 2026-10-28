require('dotenv').config();
const express = require('express');
const cors = require('cors');

const booksRouter = require('./routes/books');
const transactionsRouter = require('./routes/transactions');
const usersRouter = require('./routes/users');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/books', booksRouter);
app.use('/transactions', transactionsRouter);
app.use('/users', usersRouter);

app.get('/', (req, res) => res.json({ message: 'Library API running' }));

// 404 + error handlers
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((err, req, res, next) => {
  console.error(err);
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: 'Duplicate value: ISBN or membership ID already exists' });
  }
  res.status(500).json({ error: 'Server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
