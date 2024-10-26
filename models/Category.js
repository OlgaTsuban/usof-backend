const pool = require('../config/db');

const Category = {
    getAllCategories: async () => {
        const sql = 'SELECT * FROM categories';
        const [rows] = await pool.query(sql);
        return rows;
    },

    getCategoryById: async (categoryId) => {
        const sql = 'SELECT * FROM categories WHERE id = ?';
        const [rows] = await pool.query(sql, [categoryId]);
        return rows[0];
    },

    getPostsByCategoryId: async (categoryId) => {
        const sql = `
            SELECT posts.*
            FROM posts
            INNER JOIN post_categories ON posts.id = post_categories.post_id
            WHERE post_categories.category_id = ?
        `;
        const [rows] = await pool.query(sql, [categoryId]);
        return rows;
    },

    createCategory: async (title, description = null) => {
        const sql = 'INSERT INTO categories (title, description) VALUES (?, ?)';
        const [result] = await pool.query(sql, [title, description]);
        return result;
    },
    
    updateCategory: async (categoryId, title, description) => {
        const fields = [];
        const values = [];
    
        if (title) {
            fields.push('title = ?');
            values.push(title);
        }
        if (description) {
            fields.push('description = ?');
            values.push(description);
        }
        values.push(categoryId);
    
        const sql = `UPDATE categories SET ${fields.join(', ')} WHERE id = ?`;
        const [result] = await pool.query(sql, values);
        return result;
    },

    deleteCategory: async (categoryId) => {
        const sql = 'DELETE FROM categories WHERE id = ?';
        const [result] = await pool.query(sql, [categoryId]);
        return result;
    },
};   

module.exports = Category;