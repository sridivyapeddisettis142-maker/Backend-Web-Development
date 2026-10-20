
const repo = require('./../repository/postsRepo');
const AppError = require('./../utils/AppError');

const EDIT_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

exports.getAll = async () => repo.findAll();

exports.create = async ({ authorId, title, body }) =>
  repo.insert({ authorId, title, body });

/**
 * Edit a post only if it exists, belongs to the user,
 * and is within the 24-hour editing window.
 */
exports.editPost = async (postId, userId, changes) => {
  // 1. Check whether the post exists
  const post = await repo.findById(postId);

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  // 2. Check whether the requesting user owns the post
  if (post.authorId !== userId) {
    throw new AppError('You can only edit your own post', 403);
  }

  // 3. Check the 24-hour editing window
  if (Date.now() - new Date(post.createdAt).getTime() > EDIT_WINDOW_MS) {
    throw new AppError('Post can no longer be edited', 403);
  }

  // 4. Update only after all checks pass
  return repo.update(postId, changes);
};
