const express = require('express');
const router = express.Router();

const isAuthenticated = require('../middleware/authMiddleware');
const commentsController = require('../controllers/commentsController');
const { isAdmin } = require('../middleware/userMiddleware');

router.get('/:comment_id', isAuthenticated, commentsController.getCommentById);
router.get('/:comment_id/like',isAuthenticated, commentsController.getLikesForComment);
router.post('/:comment_id/like',isAuthenticated, commentsController.createLikeForComment);
router.patch('/:comment_id', isAuthenticated, commentsController.updateCommentById);
router.delete('/:comment_id', isAuthenticated, commentsController.deleteComment);
router.delete('/:comment_id/like',isAuthenticated, commentsController.deleteLikeForComment);
router.patch('/:comment_id/lock',isAuthenticated, commentsController.lockCommentById);


module.exports = router;