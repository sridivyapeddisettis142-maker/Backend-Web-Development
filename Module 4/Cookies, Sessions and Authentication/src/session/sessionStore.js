
const crypto = require('node:crypto');

const sessions = new Map();

function create(userId, expiresAt) {
  const sessionId = crypto.randomBytes(32).toString('hex');

  sessions.set(sessionId, {
    userId,
    expiresAt,
  });

  return sessionId;
}

function get(sessionId) {
  if (typeof sessionId !== 'string') {
    return null;
  }

  const session = sessions.get(sessionId);

  if (!session) {
    return null;
  }

  if (session.expiresAt <= Date.now()) {
    sessions.delete(sessionId);
    return null;
  }

  return session;
}

function destroy(sessionId) {
  if (typeof sessionId === 'string') {
    sessions.delete(sessionId);
  }
}

module.exports = {
  create,
  get,
  destroy,
};
