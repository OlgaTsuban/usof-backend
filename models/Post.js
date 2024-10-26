const pool = require('../config/db');

const Post = {
    // Create a new post
    create: async (title, content, authorId) => {
        const sql = 'INSERT INTO posts (title, content, author_id) VALUES (?, ?, ?)';
        try {
            const result = await pool.query(sql, [title, content, authorId]);
            console.log('Post created successfully:', result);
            return result; 
        } catch (err) {
            console.error('Error creating post:', err);
            throw err;
        }
    },

    // Get all posts with pagination
    getAll: async (page = 1, pageSize = 10) => {
        page = parseInt(page);
        pageSize = parseInt(pageSize);

        if (isNaN(page) || page < 1) page = 1; 
        if (isNaN(pageSize) || pageSize < 1) pageSize = 10; 

        const offset = (page - 1) * pageSize;
        const sql = 'SELECT * FROM posts LIMIT ? OFFSET ?';
        try {
            const [rows] = await pool.query(sql, [pageSize, offset]);
            return rows;
        } catch (err) {
            console.error('Error fetching posts:', err);
            throw err;
        }
    },
    findAll: async (queryOptions) => {
        try {
            const { page = 1, pageSize = 10 } = queryOptions;
            const userId = queryOptions.where.author_id; 
            const offset = (page - 1) * pageSize;
    
            const sql = 'SELECT * FROM posts WHERE author_id = ? LIMIT ? OFFSET ?';
            const [rows] = await pool.query(sql, [userId, pageSize, offset]);
            return rows;
        } catch (err) {
            console.error('Error fetching posts:', err);
            throw err;
        }
    },
    count: async () => {
        const sql = 'SELECT COUNT(*) AS totalPosts FROM posts';
        try {
            const [rows] = await pool.query(sql);
            return rows[0].totalPosts;  
        } catch (err) {
            console.error('Error counting posts:', err);
            throw err;
        }
    },
    countByUser: async (userId) => {
        try {
            const count = await Post.count({
                where: {
                    author_id: userId,
                    status: ['active', 'inactive'] 
                }
            });
            return count;
        } catch (error) {
            throw new Error(`Error counting posts for user ${userId}: ${error.message}`);
        }
    },

    // Get a specific post by ID
    getById: async (postId) => {
        const sql = 'SELECT * FROM posts WHERE id = ?';
        try {
            const [rows] = await pool.query(sql, [postId]);
            return rows.length > 0 ? rows[0] : null;
        } catch (err) {
            console.error('Error fetching post by ID:', err);
            throw err;
        }
    },

    // Update a post by ID
    updateById: async (postId, title, content) => {
        const sql = 'UPDATE posts SET title = ?, content = ? WHERE id = ?';
        try {
            const result = await pool.query(sql, [title, content, postId]);
            console.log('Post updated successfully:', result);
            return result;
        } catch (err) {
            console.error('Error updating post:', err);
            throw err;
        }
    },
    updateByAdmin: async (postId, active) => {
        const sql = 'UPDATE posts SET  status = ? WHERE id = ?';
        try {
            const result = await pool.query(sql, [active, postId]);
            console.log('Post updated by admin successfully:', result);
            return result;
        } catch (err) {
            console.error('Error updating post by admin:', err);
            throw err;
        }
    },
    
    // Delete a post by ID
    deleteById: async (postId) => {
        const sql = 'DELETE FROM posts WHERE id = ?';
        try {
            const result = await pool.query(sql, [postId]);
            console.log('Post deleted successfully:', result);
            return result;
        } catch (err) {
            console.error('Error deleting post:', err);
            throw err;
        }
    },

    getComments: async (postId) => {
        const sql = 'SELECT * FROM comments WHERE post_id = ? ORDER BY created_at DESC';
        try {
            const [rows] = await pool.query(sql, [postId]);
            return rows;
        } catch (err) {
            console.error('Error fetching comments:', err);
            throw err;
        }
    },

    // Create a new comment for a specific post
    createComment: async (postId, authorId, content) => {
        const [post] = await pool.query(`SELECT locked FROM posts WHERE id = ?`, [postId]);
        if (post.locked) {
            return res.status(403).send({ error: 'This post is locked. You cannot add comments.' });
        }

        const sql = 'INSERT INTO comments (post_id, author_id, content) VALUES (?, ?, ?)';
        try {
            const result = await pool.query(sql, [postId, authorId, content]);
            return result;
        } catch (err) {
            console.error('Error creating comment:', err);
            throw err;
        }
    },

    getCategories: async (postId) => {
        const sql = `
            SELECT categories.* 
            FROM categories
            INNER JOIN post_categories ON categories.id = post_categories.category_id
            WHERE post_categories.post_id = ? `;

        try {
            const [rows] = await pool.query(sql, [postId]);
            return rows;
        } catch (err) {
            console.error('Error fetching categories:', err);
            throw err;
        }
    },

    getLikes: async (postId) => {
        const sql = `
            SELECT users.id, users.login, likes.type
            FROM likes
            INNER JOIN users ON likes.author_id = users.id
            WHERE likes.post_id = ? and likes.comment_id is NULL`;

        try {
            const [rows] = await pool.query(sql, [postId]);
            return rows;
        } catch (err) {
            console.error('Error fetching likes:', err);
            throw err;
        }
    },
    createPost: async (authorId, title, content, image) => {
        const sql = 'INSERT INTO posts (author_id, title, content, images) VALUES (?, ?, ?, ?)';
        try {
            const [result] = await pool.query(sql, [authorId, title, content, image]);
            return result;
        } catch (err) {
            console.error('Error creating post:', err);
            throw err;
        }
    },

    addPostCategory: async (postId, categoryId) => {
        const sql = 'INSERT INTO post_categories (post_id, category_id) VALUES (?, ?)';

        try {
            await pool.query(sql, [postId, categoryId]);
        } catch (err) {
            console.error('Error associating post with category:', err);
            throw err;
        }
    },

    findLikeByAuthorAndPost: async (authorId, postId) => {
        const sql = `SELECT * FROM likes WHERE author_id = ? AND post_id = ?`;
        const [rows] = await pool.query(sql, [authorId, postId]);
        return rows.length > 0 ? rows[0] : null;
    },
    
    // Function to create a like
    createLike: async (authorId, postId, type) => {
        const sql = `INSERT INTO likes (author_id, post_id, type) VALUES (?, ?, ?)`;
        const [result] = await pool.query(sql, [authorId, postId, type]);
        return result;
    },
    updatePostCategories: async (postId, categories) => {
        await pool.query(`DELETE FROM post_categories WHERE post_id = ?`, [postId]);
    
        for (const categoryId of categories) {
            await pool.query(`INSERT INTO post_categories (post_id, category_id) VALUES (?, ?)`, [postId, categoryId]);
        }
    },
    deletePostById: async (postId) => {
        const sql = `DELETE FROM posts WHERE id = ?`;
        await pool.query(sql, [postId]);
    },
    findLikeByAuthorAndPost: async (authorId, postId) => {
        const sql = `SELECT * FROM likes WHERE author_id = ? AND post_id = ?`;
        const [rows] = await pool.query(sql, [authorId, postId]);
        return rows.length > 0 ? rows[0] : null;
    },
    
    deleteLikeById: async (likeId) => {
        const sql = `DELETE FROM likes WHERE id = ?`;
        await pool.query(sql, [likeId]);
    },
    getSortedPosts: async (sort) => {
        const orderBy = sort === 'date' ? 'publish_date DESC' : '(SELECT COUNT(*) FROM likes WHERE post_id = posts.id) DESC';
        const sql = `SELECT * FROM posts ORDER BY ${orderBy}`;
        
        const [rows] = await pool.query(sql);
        return rows;
    },
    getFilteredPosts: async ({ category, startDate, endDate, status }) => {
        try {
            let query = `
                SELECT DISTINCT p.* 
                FROM posts p
                LEFT JOIN post_categories pc ON p.id = pc.post_id
                LEFT JOIN categories c ON pc.category_id = c.id
                WHERE 1=1
            `;
            const params = []; 
            if (category) {
                const categories = category.split(',').map(cat => cat.trim());
                query += ` AND c.title IN (${categories.map(() => '?').join(',')})`;
                params.push(...categories);
            }
            if (startDate && endDate) {
                query += ` AND p.publish_date BETWEEN ? AND ?`;
                params.push(startDate, endDate);
            }
    
            if (status) {
                query += ` AND LOWER(p.status) = LOWER(?)`;
                params.push(status);
            }
    
            console.log(`Final query: ${query}`);
            console.log(`Params: ${params}`);
    
            const [rows] = await pool.query(query, params);
            return rows; 
        } catch (err) {
            throw err;
        }
    },    

    lockPost: async (postId, locked) => {
        try {
            const query = `UPDATE posts SET locked = ? WHERE id = ?`;
            const result = await pool.query(query, [locked, postId]);
            return result;
        } catch (error) {
            console.error(error);
            throw err;
        }
    },    
    

};

module.exports = Post;
