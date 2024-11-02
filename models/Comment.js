const pool = require('../config/db');
class Comment {
    
    static async getCommentById(commentId) {
        const sql = 'SELECT * FROM comments WHERE id = ?';
        const [rows] = await pool.query(sql, [commentId]);
        return rows.length ? rows[0] : null;
    }

    static async getLikesForComment(commentId) {
        const sql = 'SELECT * FROM likes WHERE comment_id = ?';
        const [rows] = await pool.query(sql, [commentId]);
        return rows;
    }

    static async createLikeForComment(authorId, postId, commentId, type) {
        // Check if the user has already liked or disliked this comment
        const sqlCheck = `SELECT * FROM likes WHERE author_id = ? AND comment_id = ?`;
        const [existingLikes] = await pool.query(sqlCheck, [authorId, commentId]);
    
        if (existingLikes.length) {
            // Check if the existing type is the same as the current type
            const existingType = existingLikes[0].type;
            console.log(existingType);
            if (existingType === type) {
                return { status: 400, message: `You have already given a ${type} to this comment.` };
            }
    
            // If the existing type is different, switch the like/dislike
            const ratingAdjustment = type === 'like' ? 1 : -1; 
            const updateRatingSql = `UPDATE comments SET rating = rating + ? WHERE id = ?`;
            await pool.query(updateRatingSql, [ratingAdjustment, commentId]);
    
            const updateLikeSql = `UPDATE likes SET type = ? WHERE author_id = ? AND comment_id = ?`;
            await pool.query(updateLikeSql, [type, authorId, commentId]);
    
            return { status: 200, message: `Comment rating updated to ${type}` };
        }
    
        // No existing like/dislike found, insert new record
        const ratingAdjustment = type === 'like' ? 1 : -1;
        const updateRatingSql = `UPDATE comments SET rating = rating + ? WHERE id = ?`;
        await pool.query(updateRatingSql, [ratingAdjustment, commentId]);
    
        const insertSql = `INSERT INTO likes (author_id, post_id, comment_id, type) VALUES (?, ?, ?, ?)`;
        const [result] = await pool.query(insertSql, [authorId, postId, commentId, type]);
    
        return { status: 201, message: 'Like/dislike added', result };
    }
    

    static async updateCommentById(commentId, content, status) {
        const sql = 'UPDATE comments SET content = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
        await pool.query(sql, [content, status, commentId]);
    }

    static async deleteLikeForComment(authorId, commentId) {
        const sql = 'DELETE FROM likes WHERE author_id = ? AND comment_id = ?';
        try {
            const [result] = await pool.query(sql, [authorId, commentId]);
            return result;
        } catch (error) {
            throw error;
        }
    }

    static async getLikeByUserAndComment(authorId, commentId) {
        const sql = 'SELECT * FROM likes WHERE author_id = ? AND comment_id = ?';
        try {
            const [rows] = await pool.query(sql, [authorId, commentId]);
            return rows[0]; 
        } catch (error) {
            throw error;
        }
    }

    static async deleteCommentById(commentId) {
        const sql = 'DELETE FROM comments WHERE id = ?';
        try {
            const [result] = await pool.query(sql, [commentId]);
            return result;
        } catch (error) {
            throw error;
        }
    }

    static async updateCommentByAdmin(postId, active) {
        const sql = 'UPDATE comments SET  status = ? WHERE id = ?';
        try {
            const result = await pool.query(sql, [active, postId]);
            console.log('Post updated by admin successfully:', result);
            return result;
        } catch (err) {
            console.error('Error updating comment by admin:', err);
            throw err;
        }
    }

    static async lockComment(commentId, locked) {
        try {
            
            const query = `UPDATE comments SET locked = ? WHERE id = ?`;
            const result =await pool.query(query, [locked, commentId]);
            console.log('Post updated by admin successfully:', result);
            return result;
            //res.status(200).send({ message: `Comment ${locked ? 'locked' : 'unlocked'} successfully.` });
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}

module.exports = Comment;



// const Comment = {
//     getCommentById: async (commentId) => {
//         const sql = 'SELECT * FROM comments WHERE id = ?';
//         const [rows] = await pool.query(sql, [commentId]);
//         return rows.length ? rows[0] : null;
//     },

//     getLikesForComment: async (commentId) => {
//         const sql = 'SELECT * FROM likes WHERE comment_id = ?';
//         const [rows] = await pool.query(sql, [commentId]);
//         return rows;
//     },

//     createLikeForComment: async (authorId, postId, commentId, type) => {
//         const sql = 'INSERT INTO likes (author_id,post_id ,comment_id, type) VALUES (?, ?, ?, ?)';
//         const [result] = await pool.query(sql, [authorId, postId, commentId, type]);
//         return result;
//     },

//     updateCommentById: async (commentId, content, status) => {
//         const sql = 'UPDATE comments SET content = ?,status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
//         await pool.query(sql, [content,status, commentId]);
//     },

//     deleteLikeForComment: async (authorId, commentId) => {
//         const sql = 'DELETE FROM likes WHERE author_id = ? AND comment_id = ?';
//         try {
//             const [result] = await pool.query(sql, [authorId, commentId]);
//             return result;
//         } catch (error) {
//             throw error;
//         }
//     },
//     getLikeByUserAndComment: async (authorId, commentId) => {
//         const sql = 'SELECT * FROM likes WHERE author_id = ? AND comment_id = ?';
//         try {
//             const [rows] = await pool.query(sql, [authorId, commentId]);
//             return rows[0]; 
//         } catch (error) {
//             throw error;
//         }
//     },
//     deleteCommentById: async (commentId) => {
//         const sql = 'DELETE FROM comments WHERE id = ?';
//         try {
//             const [result] = await pool.query(sql, [commentId]);
//             return result;
//         } catch (error) {
//             throw error;
//         }
//     },
//     updateCommentByAdmin: async (postId, active) => {
//         const sql = 'UPDATE comments SET  status = ? WHERE id = ?';
//         try {
//             const result = await pool.query(sql, [active, postId]);
//             console.log('Post updated by admin successfully:', result);
//             return result;
//         } catch (err) {
//             console.error('Error updating comment by admin:', err);
//             throw err;
//         }
//     },
//     lockComment: async (commentId, locked) => {
//         try {
            
//             const query = `UPDATE comments SET locked = ? WHERE id = ?`;
//             const result =await pool.query(query, [locked, commentId]);
//             console.log('Post updated by admin successfully:', result);
//             return result;
//             //res.status(200).send({ message: `Comment ${locked ? 'locked' : 'unlocked'} successfully.` });
//         } catch (error) {
//             console.error(error);
//             throw err;
//         }
//     },
    
// };

// module.exports = Comment;