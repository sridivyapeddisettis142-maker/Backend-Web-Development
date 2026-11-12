
const service = require('../services/postService');
const http = require('../utils/http');

function listPosts(req, res) {
  const result = service.listPosts(req.query);

  return http.sendList(res, result.rows, result.meta);
}

function getPost(req, res) {
  const post = service.getPost(req.params.id);

  if (!post) {
    return http.sendError(
      res,
      404,
      'NOT_FOUND',
      'Post not found'
    );
  }

  return http.sendOk(res, post);
}

function createPost(req, res) {
  const { title, author } = req.body || {};

  if (
    typeof title !== 'string' || !title.trim() ||
    typeof author !== 'string' || !author.trim()
  ) {
    return http.sendError(
      res,
      400,
      'VALIDATION_ERROR',
      'Title and author are required'
    );
  }

  const post = service.createPost({
    title: title.trim(),
    author: author.trim()
  });

  return http.sendCreated(res, post);
}

function likePost(req, res) {
  const post = service.likePost(req.params.id);

  if (!post) {
    return http.sendError(
      res,
      404,
      'NOT_FOUND',
      'Post not found'
    );
  }

  return http.sendCreated(res, {
    id: post.id,
    likes: post.likes
  });
}

function explode(req, res) {
  try {
    service.explode();
  } catch (err) {
    console.error('Internal server error:', err);

    return http.sendError(
      res,
      500,
      'INTERNAL_ERROR',
      'Something went wrong'
    );
  }
}

module.exports = {
  listPosts,
  getPost,
  createPost,
  likePost,
  explode
};
