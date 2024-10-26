const pool = require('../config/db');

const Favorite = {
    addFavorite: async (userId, postId) => {
        const query = `INSERT INTO favorite_posts (user_id, post_id) VALUES (?, ?)`;
        await pool.query(query, [userId, postId]);
    },

    removeFavorite: async (userId, postId) => {
        const query = `DELETE FROM favorite_posts WHERE user_id = ? AND post_id = ?`;
        await pool.query(query, [userId, postId]);
    },

    getFavoritePostsByUser: async (userId) => {
        const query = `
            SELECT p.* 
            FROM posts p
            JOIN favorite_posts fp ON p.id = fp.post_id
            WHERE fp.user_id = ?`;
        const [rows] = await pool.query(query, [userId]);
        return rows;
    },

    removePostFromFavorites: async (userId, postId) => {
        const query = `DELETE FROM favorite_posts WHERE user_id = ? AND post_id = ?`;
        await pool.query(query, [userId, postId]);
    },

    getPaginatedPosts: async (page, limit, user_id) => {
        const offset = (page - 1) * limit; 
        const query = `
            SELECT p.* 
            FROM posts p
            JOIN favorite_posts fp ON p.id = fp.post_id
            WHERE fp.user_id = ?
            ORDER BY p.publish_date DESC
            LIMIT ? OFFSET ?`;

        const [rows] = await pool.query(query, [user_id, limit, offset]);

        const [totalResult] = await pool.query('SELECT COUNT(*) as total FROM favorite_posts');
        const totalPosts = totalResult[0].total;

        return { posts: rows, totalPosts };
    },
};

module.exports = Favorite;