
const sessionTtlMs = Number(process.env.SESSION_TTL_MS || 3600000);

if (!Number.isSafeInteger(sessionTtlMs) || sessionTtlMs <= 0) {
  throw new Error('SESSION_TTL_MS must be a positive integer');
}

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.COOKIE_SECURE === 'true',
  signed: true,
  path: '/',
  maxAge: sessionTtlMs,
};

module.exports = {
  cookieOptions,
  sessionTtlMs,
};
