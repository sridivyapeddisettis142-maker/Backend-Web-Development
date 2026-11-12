
const sessionStore = require('../session/sessionStore');
const { findUserById } = require('../repositories/userRepository');

module.exports = async function requireSession(req, res, next) {
  try {
    const sessionId = req.signedCookies?.sid;

    if (!sessionId || typeof sessionId !== 'string') {
      return res.status(401).json({
        error: {
          code: 'UNAUTHENTICATED',
          message: 'Authentication required',
        },
      });
    }

    const session = sessionStore.get(sessionId);

    if (!session) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHENTICATED',
          message: 'Authentication required',
        },
      });
    }

    const user = await findUserById(session.userId);

    if (!user) {
      sessionStore.destroy(sessionId);

      return res.status(401).json({
        error: {
          code: 'UNAUTHENTICATED',
          message: 'Authentication required',
        },
      });
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    next();
  } catch (error) {
    next(error);
  }
};
