const pool = require('../config/db');

class Favorite {
    static async addFavorite(userId, postId) {
        const query = `INSERT INTO favorite_posts (user_id, post_id) VALUES (?, ?)`;
        await pool.query(query, [userId, postId]);
    }

    static async removeFavorite(userId, postId) {
        const query = `DELETE FROM favorite_posts WHERE user_id = ? AND post_id = ?`;
        await pool.query(query, [userId, postId]);
    }

    static async getFavoritePostsByUser(userId) {
        const query = `
            SELECT p.* 
            FROM posts p
            JOIN favorite_posts fp ON p.id = fp.post_id
            WHERE fp.user_id = ?`;
        const [rows] = await pool.query(query, [userId]);
        return rows;
    }

    static async removePostFromFavorites(userId, postId) {
        const query = `DELETE FROM favorite_posts WHERE user_id = ? AND post_id = ?`;
        await pool.query(query, [userId, postId]);
    }

    static async getPaginatedPosts(page, limit, userId) {
        const offset = (page - 1) * limit; 
        const query = `
            SELECT p.* 
            FROM posts p
            JOIN favorite_posts fp ON p.id = fp.post_id
            WHERE fp.user_id = ?
            ORDER BY p.publish_date DESC
            LIMIT ? OFFSET ?`;

        const [rows] = await pool.query(query, [userId, limit, offset]);

        const [totalResult] = await pool.query('SELECT COUNT(*) as total FROM favorite_posts WHERE user_id = ?', [userId]);
        const totalPosts = totalResult[0].total;

        return { posts: rows, totalPosts };
    }
}

module.exports = Favorite;