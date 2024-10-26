const Comment = require('../models/Comment');
const Post = require('../models/Post');

exports.getCommentById = async (req, res) => {
    const commentId = req.params.comment_id;

    try {
        const comment = await Comment.getCommentById(commentId);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found.' });
        }

        res.status(200).json(comment);
    } catch (err) {
        console.error('Error fetching comment:', err);
        res.status(500).json({ message: 'Error fetching comment', error: err.message });
    }
};

exports.getLikesForComment = async (req, res) => {
    const commentId = req.params.comment_id;
    console.log(commentId);
    try {
        const likes = await Comment.getLikesForComment(commentId);
        console.log(likes);
        if (!likes.length) {
            return res.status(404).json({ message: 'No likes found for this comment.' });
        }

        res.status(200).json(likes);
    } catch (err) {
        console.error('Error fetching likes:', err);
        res.status(500).json({ message: 'Error fetching likes', error: err.message });
    }
};

exports.createLikeForComment = async (req, res) => {
    const commentId = req.params.comment_id;
    const { type } = req.body; 
    const authorId = req.session.user.id; 

    if (!['like', 'dislike'].includes(type)) {
        return res.status(400).json({ message: 'Invalid like type. Only "like" or "dislike" are allowed.' });
    }

    try {
        const comment = await Comment.getCommentById(commentId); // Assuming this returns comment data with post_id
        const postId = parseInt(comment.post_id, 10);

        if (comment.locked) {
            return res.status(403).send({ error: 'This comment is locked. You cannot like it.' });
        }

        if (isNaN(postId)) {
            return res.status(400).json({ message: 'Invalid post_id retrieved from comment.' });
        }

        const postExists = await Post.getById(postId);
        if (!postExists) {
            return res.status(404).json({ message: 'Post does not exist.' });
        }

        const result = await Comment.createLikeForComment(authorId, postId, commentId, type);

        res.status(201).json({ message: 'Like added successfully', likeId: result.insertId });
    } catch (err) {
        console.error('Error creating like:', err);
        res.status(500).json({ message: 'Error creating like', error: err.message });
    }
};

exports.updateCommentById = async (req, res) => {
    const commentId = req.params.comment_id;
    const { content, active } = req.body;
    const authorId = req.session.user.id; 
    const userRole = req.session.user.role;
    console.log(userRole);
    
    if (!content && !active) {
        return res.status(400).json({ message: 'Content/status is required to update the comment.' });
    }

    try {
        // Check if the comment belongs to the logged-in user
        const comment = await Comment.getCommentById(commentId);
        if (!comment ) {
            return res.status(404).json({ message: 'Comment not found.' });
        }
        if (comment.locked) {
            return res.status(403).send({ error: 'This comment is locked. You cannot update it.' });
        }
        if (userRole == 'admin') {
            await Comment.updateCommentByAdmin(commentId, active);
            res.status(200).json({ message: 'Comment updated successfully by Admin' });
            return;
        }
        console.log(comment.author_id);
        console.log(authorId);
        if (comment.author_id !== authorId && userRole !== 'admin') {
            return res.status(403).json({ message: 'You do not have permission to update this comment.' });
        }
        
        await Comment.updateCommentById(commentId, content, active);

        res.status(200).json({ message: 'Comment updated successfully' });
    } catch (err) {
        console.error('Error updating comment:', err);
        res.status(500).json({ message: 'Error updating comment', error: err.message });
    }
};

exports.deleteComment = async (req, res) => {
    const commentId = req.params.comment_id;
    const authorId = req.session.user.id;  
    const isAdmin = req.session.user.role === 'admin';  

    try {
        const comment = await Comment.getCommentById(commentId);
        
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        if (comment.locked) {
            return res.status(403).send({ error: 'This comment is locked. You cannot delete it.' });
        }

        if (comment.author_id !== authorId && !isAdmin) {
            return res.status(403).json({ message: 'You do not have permission to delete this comment' });
        }

        await Comment.deleteCommentById(commentId);

        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (err) {
        console.error('Error deleting comment:', err);
        res.status(500).json({ message: 'Error deleting comment', error: err.message });
    }
};

exports.deleteLikeForComment = async (req, res) => {
    const commentId = req.params.comment_id;
    const authorId = req.session.user.id;  

    try {
        const like = await Comment.getLikeByUserAndComment(authorId, commentId);

        if (!like) {
            return res.status(404).json({ message: 'Like not found for this comment' });
        }

        const comment = await Comment.getCommentById(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        if (comment.locked) {
            return res.status(403).send({ error: 'This comment is locked. You cannot delete like.' });
        }
        await Comment.deleteLikeForComment(authorId, commentId);

        res.status(200).json({ message: 'Like deleted successfully' });
    } catch (err) {
        console.error('Error deleting like:', err);
        res.status(500).json({ message: 'Error deleting like', error: err.message });
    }
};


exports.lockCommentById = async (req, res) => {
    const commentId = req.params.comment_id;
    const { lock } = req.body;
    const authorId = req.session.user.id; 
    const userRole = req.session.user.role;
    console.log(commentId);
    console.log('Comment ID:', commentId);

        if (typeof lock === 'undefined') {
            return res.status(400).json({ message: 'Lock status is required to update the comment.' });
        }
    if (!lock ) {
        return res.status(400).json({ message: 'Content/status is required to update the comment.' });
    }

    try {
        const comment = await Comment.getCommentById(commentId);
        if (!comment ) {
            return res.status(404).json({ message: 'Comment not found.' });
        }
        
        if (comment.author_id !== authorId && userRole !== 'admin') {
            return res.status(403).json({ message: 'You do not have permission to lock this comment.' });
        }
        
        await Comment.lockComment(commentId, lock);

        res.status(200).json({ message: 'Comment locked successfully' });
    } catch (err) {
        console.error('Error locking comment:', err);
        res.status(500).json({ message: 'Error locking comment', error: err.message });
    }
};