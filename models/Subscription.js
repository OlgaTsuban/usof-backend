const pool = require('../config/db');

class Subscription {
    // Subscribe to a post
    static async subscribeToPost(userId, postId) {
        const query = `INSERT INTO subscriptions (user_id, post_id) VALUES (?, ?)`;
        await pool.query(query, [userId, postId]);
    }

    // Unsubscribe from a post
    static async unsubscribeFromPost(userId, postId) {
        const query = `DELETE FROM subscriptions WHERE user_id = ? AND post_id = ?`;
        await pool.query(query, [userId, postId]);
    }

    // Get subscribed users by post
    static async getSubscribedUsers(postId) {
        const query = `SELECT user_id FROM subscriptions WHERE post_id = ?`;
        const [rows] = await pool.query(query, [postId]);
        return rows.map(row => row.user_id);
    }

    // Get subscribed posts by user
    static async getSubscribedPostsByUser(userId) {
        const query = `
            SELECT p.id, p.title, p.content, p.publish_date 
            FROM subscriptions s
            JOIN posts p ON s.post_id = p.id
            WHERE s.user_id = ?
        `;
        const [rows] = await pool.query(query, [userId]);
        return rows;
    }
    
    // Check if a user is subscribed to a post
    static async checkSubscription(userId, postId) {
        const query = `SELECT * FROM subscriptions WHERE user_id = ? AND post_id = ?`;
        const [rows] = await pool.query(query, [userId, postId]);
        return rows.length > 0;
    }
}

module.exports = Subscription;
