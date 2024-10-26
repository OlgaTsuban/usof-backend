const pool = require('../config/db');

const Comment = {
    getCommentById: async (commentId) => {
        const sql = 'SELECT * FROM comments WHERE id = ?';
        const [rows] = await pool.query(sql, [commentId]);
        return rows.length ? rows[0] : null;
    },

    getLikesForComment: async (commentId) => {
        const sql = 'SELECT * FROM likes WHERE comment_id = ?';
        const [rows] = await pool.query(sql, [commentId]);
        return rows;
    },

    createLikeForComment: async (authorId, postId, commentId, type) => {
        const sql = 'INSERT INTO likes (author_id,post_id ,comment_id, type) VALUES (?, ?, ?, ?)';
        const [result] = await pool.query(sql, [authorId, postId, commentId, type]);
        return result;
    },

    updateCommentById: async (commentId, content, status) => {
        const sql = 'UPDATE comments SET content = ?,status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
        await pool.query(sql, [content,status, commentId]);
    },

    deleteLikeForComment: async (authorId, commentId) => {
        const sql = 'DELETE FROM likes WHERE author_id = ? AND comment_id = ?';
        try {
            const [result] = await pool.query(sql, [authorId, commentId]);
            return result;
        } catch (error) {
            throw error;
        }
    },
    getLikeByUserAndComment: async (authorId, commentId) => {
        const sql = 'SELECT * FROM likes WHERE author_id = ? AND comment_id = ?';
        try {
            const [rows] = await pool.query(sql, [authorId, commentId]);
            return rows[0]; 
        } catch (error) {
            throw error;
        }
    },
    deleteCommentById: async (commentId) => {
        const sql = 'DELETE FROM comments WHERE id = ?';
        try {
            const [result] = await pool.query(sql, [commentId]);
            return result;
        } catch (error) {
            throw error;
        }
    },
    updateCommentByAdmin: async (postId, active) => {
        const sql = 'UPDATE comments SET  status = ? WHERE id = ?';
        try {
            const result = await pool.query(sql, [active, postId]);
            console.log('Post updated by admin successfully:', result);
            return result;
        } catch (err) {
            console.error('Error updating comment by admin:', err);
            throw err;
        }
    },
    lockComment: async (commentId, locked) => {
        try {
            
            const query = `UPDATE comments SET locked = ? WHERE id = ?`;
            const result =await pool.query(query, [locked, commentId]);
            console.log('Post updated by admin successfully:', result);
            return result;
            //res.status(200).send({ message: `Comment ${locked ? 'locked' : 'unlocked'} successfully.` });
        } catch (error) {
            console.error(error);
            throw err;
        }
    },
    
};

module.exports = Comment;