const pool = require('../config/db');

const User = {
    create: async (login, passwordHash, fullName, email, role) => {
        const sql = 'INSERT INTO users (login, password_hash, full_name, email, role) VALUES (?, ?, ?, ?, ?)';
        try {
            const result = await pool.query(sql, [login, passwordHash, fullName, email, role]);
            console.log('Query successful, result:', result);
            return result;  
        } catch (err) {
            console.log('Error in query:', err); 
            throw err;  
        }
    },
    findByLogin: async (login) => {
        const sql = 'SELECT * FROM users WHERE login = ?';
        try {
            const result = await pool.query(sql, [login]);
            return result;
        } catch (err) {
            console.log('Error in query:', err);
            throw err;
        }
    },
    findByLoginOrEmail: async (login, email) => {
        const sql = 'SELECT * FROM users WHERE login = ? OR email = ?';
        try {
            const result = await pool.query(sql, [login, email]);
            return result.length > 0 ? result[0] : null;
        } catch (err) {
            console.log('Error in query:', err);
            throw err;
        }
    },
    findByEmail: async (email) => {
        const sql = 'SELECT * FROM users WHERE email = ?';
        try {
            const result = await pool.query(sql, [email]);
            return result.length > 0 ? result[0] : null;
        } catch (err) {
            console.log('Error in query:', err);
            throw err;
        }
    },
    updatePassword: async (userId, newPassword) => {
        const sql = 'UPDATE users SET password_hash = ? WHERE id = ?';

        try {
            const result = await pool.query(sql, [ newPassword, userId]);
            return result.length > 0 ? result[0] : null;
        } catch (err) {
            console.log('Error in query:', err);
            throw err;
        }
    },
    getAll: async () => {
        const sql = 'SELECT * FROM users';
        const [rows] = await pool.query(sql);
        return rows;  
    },
    getById: async (userId) => {
        const sql = 'SELECT * FROM users WHERE id = ?';
        const [rows] = await pool.query(sql, [userId]);
        return rows[0];  
    },
    createByAdmin: async (userData) => {
        const sql = 'INSERT INTO users (login, email, password_hash, role) VALUES (?, ?, ?, ?)';
        const [result] = await pool.query(sql, [userData.login, userData.email, userData.password_hash, userData.role]);
        return { id: result.insertId, ...userData };      
    },
    updateAvatar: async (userId, avatarFilename) => {
        const sql = 'UPDATE users SET profile_picture = ? WHERE id = ?';
        await pool.query(sql, [avatarFilename, userId]);
    },
    deleteUser: async (userId) => {
        const sql = 'DELETE FROM users WHERE id = ?';
        try {
            const result = await pool.query(sql, [userId]);
            return result; 
        } catch (err) {
            console.log('Error deleting user:', err);
            throw err; 
        }
    },

    getEmailsByUserIds: async (userIds) => {
        const query = `SELECT email FROM users WHERE id IN (?)`;
        const [rows] = await pool.query(query, [userIds]);
        return rows.map(row => row.email);
    }
};

module.exports = User;
