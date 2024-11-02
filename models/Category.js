const pool = require('../config/db');

class Category {
    // Get all categories
    static async getAllCategories() {
        const sql = 'SELECT * FROM categories';
        const [rows] = await pool.query(sql);
        return rows;
    }

    // Get a specific category by ID
    static async getCategoryById(categoryId) {
        const sql = 'SELECT * FROM categories WHERE id = ?';
        const [rows] = await pool.query(sql, [categoryId]);
        return rows[0];
    }

    // Get posts for a specific category by ID
    static async getPostsByCategoryId(categoryId) {
        const sql = `
            SELECT posts.*
            FROM posts
            INNER JOIN post_categories ON posts.id = post_categories.post_id
            WHERE post_categories.category_id = ?
        `;
        const [rows] = await pool.query(sql, [categoryId]);
        return rows;
    }

    // Create a new category
    static async createCategory(title, description = null) {
        const sql = 'INSERT INTO categories (title, description) VALUES (?, ?)';
        const [result] = await pool.query(sql, [title, description]);
        return result;
    }

    // Update an existing category
    static async updateCategory(categoryId, title, description) {
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
    }

    // Delete a category by ID
    static async deleteCategory(categoryId) {
        const sql = 'DELETE FROM categories WHERE id = ?';
        const [result] = await pool.query(sql, [categoryId]);
        return result;
    }
}

module.exports = Category;
