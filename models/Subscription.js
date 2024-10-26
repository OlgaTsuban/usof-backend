const pool = require('../config/db');

const Subscription = {
    // Subscribe to a post
    subscribeToPost: async (userId, postId) => {
        const query = `INSERT INTO subscriptions (user_id, post_id) VALUES (?, ?)`;
        await pool.query(query, [userId, postId]);
    },

    // Unsubscribe from a post
    unsubscribeFromPost: async (userId, postId) => {
        const query = `DELETE FROM subscriptions WHERE user_id = ? AND post_id = ?`;
        await pool.query(query, [userId, postId]);
    },

    // Get subscribed users by post
    getSubscribedUsers: async (postId) => {
        const query = `SELECT user_id FROM subscriptions WHERE post_id = ?`;
        const [rows] = await pool.query(query, [postId]);
        return rows.map(row => row.user_id);
    },

    getSubscribedPostsByUser: async (userId) => {
        const query = `
            SELECT p.id, p.title, p.content, p.publish_date 
            FROM subscriptions s
            JOIN posts p ON s.post_id = p.id
            WHERE s.user_id = ?
        `;
        const [rows] = await pool.query(query, [userId]);
        return rows;
    },
    
    checkSubscription: async (userId, postId) => {
    const [rows] = await pool.query(
        'SELECT * FROM subscriptions WHERE user_id = ? AND post_id = ?',
        [userId, postId]
    );
    return rows.length > 0;
},

};

module.exports = Subscription;
