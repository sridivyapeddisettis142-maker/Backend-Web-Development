
const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/userRepository');

class AuthError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function safeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email
  };
}

async function register({ name, email, password }) {
  if (
    !isNonEmptyString(name) ||
    !isNonEmptyString(email) ||
    !isNonEmptyString(password)
  ) {
    throw new AuthError(400, 'INVALID_INPUT', 'Name, email and password are required');
  }

  const normalizedEmail = normalizeEmail(email);

  const existingUser = await userRepository.findUserByEmail(normalizedEmail);

  if (existingUser) {
    throw new AuthError(409, 'EMAIL_EXISTS', 'Email already exists');
  }

  const cost = Number(process.env.BCRYPT_COST || 12);
  const passwordHash = await bcrypt.hash(password, cost);

  const user = await userRepository.createUser({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash
  });

  return safeUser(user);
}

async function login({ email, password }) {
  if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
    throw new AuthError(400, 'INVALID_INPUT', 'Email and password are required');
  }

  const normalizedEmail = normalizeEmail(email);

  const user = await userRepository.findUserByEmail(normalizedEmail);

  if (!user) {
    throw new AuthError(
      401,
      'INVALID_CREDENTIALS',
      'Invalid email or password'
    );
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);

  if (!isValid) {
    throw new AuthError(
      401,
      'INVALID_CREDENTIALS',
      'Invalid email or password'
    );
  }

  return safeUser(user);
}

module.exports = {
  register,
  login,
  AuthError
};
