const pool = require('../config/db');

class Post  {
    // Create a new post
    static async create (title, content, authorId)  {
        const sql = 'INSERT INTO posts (title, content, author_id) VALUES (?, ?, ?)';
        try {
            const result = await pool.query(sql, [title, content, authorId]);
            console.log('Post created successfully:', result);
            return result; 
        } catch (err) {
            console.error('Error creating post:', err);
            throw err;
        }
    }

    // Get all posts with pagination
    static async getAll (page = 1, pageSize = 10) {
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
    }
    static async findAll (queryOptions) {
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
    }
    static async count ()  {
        const sql = 'SELECT COUNT(*) AS totalPosts FROM posts';
        try {
            const [rows] = await pool.query(sql);
            return rows[0].totalPosts;  
        } catch (err) {
            console.error('Error counting posts:', err);
            throw err;
        }
    }
    static async countByUser (userId) {
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
    }

    // Get a specific post by ID
    static async getById (postId) {
        const sql = 'SELECT * FROM posts WHERE id = ?';
        try {
            const [rows] = await pool.query(sql, [postId]);
            return rows.length > 0 ? rows[0] : null;
        } catch (err) {
            console.error('Error fetching post by ID:', err);
            throw err;
        }
    }

    // Update a post by ID
    static async updateById (postId, title, content) {
        const sql = 'UPDATE posts SET title = ?, content = ? WHERE id = ?';
        try {
            const result = await pool.query(sql, [title, content, postId]);
            console.log('Post updated successfully:', result);
            return result;
        } catch (err) {
            console.error('Error updating post:', err);
            throw err;
        }
    }

    static async updateByAdmin (postId, active) {
        const sql = 'UPDATE posts SET  status = ? WHERE id = ?';
        try {
            const result = await pool.query(sql, [active, postId]);
            console.log('Post updated by admin successfully:', result);
            return result;
        } catch (err) {
            console.error('Error updating post by admin:', err);
            throw err;
        }
    }
    
    // Delete a post by ID
    static async deleteById (postId) {
        const sql = 'DELETE FROM posts WHERE id = ?';
        try {
            const result = await pool.query(sql, [postId]);
            console.log('Post deleted successfully:', result);
            return result;
        } catch (err) {
            console.error('Error deleting post:', err);
            throw err;
        }
    }

    static async getComments (postId) {
        const sql = 'SELECT * FROM comments WHERE post_id = ? ORDER BY created_at DESC';
        try {
            const [rows] = await pool.query(sql, [postId]);
            return rows;
        } catch (err) {
            console.error('Error fetching comments:', err);
            throw err;
        }
    }

    // Create a new comment for a specific post
    static async createComment (postId, authorId, content)  {
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
    }

    static async getCategories (postId) {
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
    }

    static async getLikes (postId)  {
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
    }

    static async createPost (authorId, title, content, image)  {
        const sql = 'INSERT INTO posts (author_id, title, content, images) VALUES (?, ?, ?, ?)';
        try {
            const [result] = await pool.query(sql, [authorId, title, content, image]);
            return result;
        } catch (err) {
            console.error('Error creating post:', err);
            throw err;
        }
    }

    static async addPostCategory (postId, categoryId) {
        const sql = 'INSERT INTO post_categories (post_id, category_id) VALUES (?, ?)';

        try {
            await pool.query(sql, [postId, categoryId]);
        } catch (err) {
            console.error('Error associating post with category:', err);
            throw err;
        }
    }

    static async findLikeByAuthorAndPost (authorId, postId) {
        const sql = `SELECT * FROM likes WHERE author_id = ? AND post_id = ?`;
        const [rows] = await pool.query(sql, [authorId, postId]);
        return rows.length > 0 ? rows[0] : null;
    }
    
    // Function to create a like
    static async createLike (authorId, postId, type) {
        const sql = `INSERT INTO likes (author_id, post_id, type) VALUES (?, ?, ?)`;
        const [result] = await pool.query(sql, [authorId, postId, type]);
        return result;
    }

    static async updatePostCategories(postId, categories) {
        await pool.query(`DELETE FROM post_categories WHERE post_id = ?`, [postId]);
    
        for (const categoryId of categories) {
            await pool.query(`INSERT INTO post_categories (post_id, category_id) VALUES (?, ?)`, [postId, categoryId]);
        }
    }
    static async deletePostById (postId)  {
        const sql = `DELETE FROM posts WHERE id = ?`;
        await pool.query(sql, [postId]);
    }
    static async findLikeByAuthorAndPost (authorId, postId)  {
        const sql = `SELECT * FROM likes WHERE author_id = ? AND post_id = ?`;
        const [rows] = await pool.query(sql, [authorId, postId]);
        return rows.length > 0 ? rows[0] : null;
    }
    
    static async deleteLikeById (likeId)  {
        const sql = `DELETE FROM likes WHERE id = ?`;
        await pool.query(sql, [likeId]);
    }
    static async getSortedPosts (sort)  {
        const orderBy = sort === 'date' ? 'publish_date DESC' : '(SELECT COUNT(*) FROM likes WHERE post_id = posts.id) DESC';
        const sql = `SELECT * FROM posts ORDER BY ${orderBy}`;
        
        const [rows] = await pool.query(sql);
        return rows;
    }
    static async getFilteredPosts ({ category, startDate, endDate, status })  {
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
    }    

    static async lockPost (postId, locked)  {
        try {
            const query = `UPDATE posts SET locked = ? WHERE id = ?`;
            const result = await pool.query(query, [locked, postId]);
            return result;
        } catch (error) {
            console.error(error);
            throw err;
        }
    }  
    

};

module.exports = Post;
