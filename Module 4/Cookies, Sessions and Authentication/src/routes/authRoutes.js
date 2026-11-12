
const express = require('express');
const bcrypt = require('bcryptjs');

const {
  findUserByEmail,
} = require('../repositories/userRepository');

const sessionStore = require('../session/sessionStore');
const requireSession = require('../middleware/requireSession');

const {
  cookieOptions,
  sessionTtlMs,
} = require('../config/cookieConfig');

const router = express.Router();

function safeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

function unauthorized(res) {
  return res.status(401).json({
    error: {
      code: 'INVALID_CREDENTIALS',
      message: 'Invalid email or password',
    },
  });
}

// POST /auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !email.trim() ||
      !password ||
      email.length > 254 ||
      password.length > 1024
    ) {
      return res.status(400).json({
        error: {
          code: 'INVALID_INPUT',
          message: 'Valid email and password are required',
        },
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await findUserByEmail(normalizedEmail);

    if (!user) {
      return unauthorized(res);
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!passwordMatches) {
      return unauthorized(res);
    }

    const expiresAt = Date.now() + sessionTtlMs;

    const sessionId = sessionStore.create(
      user.id,
      expiresAt
    );

    res.cookie('sid', sessionId, cookieOptions);

    return res.status(200).json({
      message: 'Login successful',
      user: safeUser(user),
    });
  } catch (error) {
    next(error);
  }
});

// GET /auth/me
router.get('/me', requireSession, (req, res) => {
  return res.status(200).json({
    user: req.user,
  });
});

// POST /auth/logout
router.post('/logout', (req, res) => {
  const sessionId = req.signedCookies?.sid;

  if (typeof sessionId === 'string') {
    sessionStore.destroy(sessionId);
  }

  res.clearCookie('sid', cookieOptions);

  return res.status(204).end();
});

module.exports = router;
