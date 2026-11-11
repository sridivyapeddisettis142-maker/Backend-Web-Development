
require('dotenv').config();

const express = require('express');
const authRoutes = require('./routes/authRoutes');
const { AuthError } = require('./services/authService');

const app = express();

app.use(express.json());

app.use('/auth', authRoutes);

app.use((error, req, res, next) => {
  // Malformed JSON
  if (error instanceof SyntaxError && error.status === 400) {
    return res.status(400).json({
      error: {
        code: 'INVALID_JSON',
        message: 'Invalid JSON input'
      }
    });
  }

  // Expected authentication errors
  if (error instanceof AuthError) {
    return res.status(error.status).json({
      error: {
        code: error.code,
        message: error.message
      }
    });
  }

  // Duplicate email (including concurrent registration)
  if (error.code === 'P2002') {
    return res.status(409).json({
      error: {
        code: 'EMAIL_EXISTS',
        message: 'Email already exists'
      }
    });
  }

  // Unexpected internal errors
  console.error('Internal server error');

  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error'
    }
  });
});

const port = Number(process.env.PORT || 3000);

app.listen(port, () => {
  console.log(`API listening on ${port}`);
});
