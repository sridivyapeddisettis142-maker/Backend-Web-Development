
const express = require('express');
const postRoutes = require('./routes/postRoutes');
const { resetData } = require('./data/postStore');
const controller = require('./controllers/postController');

function createApp() {
  const app = express();

  app.use(express.json());

  app.use('/', postRoutes);

  // Safe internal failure route for testing
  app.get('/test/internal-error', controller.explode);

  // Handle unknown routes
  app.use((req, res) => {
    return res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: 'Route not found'
      }
    });
  });

  // Handle malformed JSON and unexpected errors
  app.use((err, req, res, next) => {
    if (res.headersSent) {
      return next(err);
    }

    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid JSON request body'
        }
      });
    }

    console.error('Unexpected error:', err);

    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Something went wrong'
      }
    });
  });

  return app;
}

if (require.main === module) {
  const app = createApp();
  const port = 3000;

  app.listen(port, () => {
    console.log(`API Design Best Practices listening on port ${port}`);
  });
}

module.exports = {
  createApp,
  resetData
};
