const Post = require('../models/Post');
const AuthController = require('../controllers/authController');
const pool = require('../config/db');
const multer = require('multer');
const path = require('path');

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/posts/'); // Directory where images will be stored
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)); // Custom filename
    }
});

const upload = multer({ storage: storage }).single('image');
class PostController {
    // const storage = multer.diskStorage({
    //     destination: (req, file, cb) => {
    //         cb(null, 'uploads/posts/'); // Directory where images will be stored
    //     },
    //     filename: (req, file, cb) => {
    //         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    //         cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)); // Custom filename
    //     }
    // });

    // const upload = multer({ storage: storage }).single('image'); // Only one image per post
    static async getAllByUser (userId, page = 1, pageSize = 10) {
        try {
            page = parseInt(page);
            pageSize = parseInt(pageSize);

            if (isNaN(page) || page < 1) page = 1; // Set to page 1 if invalid
            if (isNaN(pageSize) || pageSize < 1) pageSize = 10; // Set to default pageSize if invalid

            const offset = (page - 1) * pageSize;

            // Query options to filter by userId and include pagination
            const queryOptions = {
                where: {
                    author_id: userId,
                    status: ['active', 'inactive'] // Fetch both active and inactive posts
                },
                limit: pageSize,
                offset: offset
            };

            const posts = await Post.findAll(queryOptions);
            return posts;
        } catch (err) {
            console.error(`Error fetching posts for user ${userId}:`, err);
            throw new Error(`Error fetching posts for user ${userId}: ${err.message}`);
        }
    }

    static async getAllPosts (req, res) {
        try {
            // Pagination parameters from query string, with defaults
            const page = parseInt(req.query.page) || 1; // Default to page 1
            const pageSize = parseInt(req.query.pageSize) || 10; // Default to 10 posts per page
            console.log(page);
            console.log(pageSize);
            const offset = (page - 1) * pageSize;
            console.log(offset);
            const isAdmin = req.session.user.role;
            console.log(isAdmin);
            // Fetch posts from the database, apply pagination (use ORM method or raw SQL query)
            // const posts = await Post.getAll({
            //     limit: pageSize,
            //     offset: offset
            // });
            let posts;
            let totalPosts;
            if (isAdmin == 'admin') {
                // Admin can see all posts
                posts = await Post.getAll({
                    limit: pageSize,
                    offset: offset
                });

                totalPosts = await Post.count();
            } else {
                const userId = req.session.user.id;

                posts = await getAllByUser(
                    userId,
                    { limit: pageSize, offset: offset }
                );

                totalPosts = await Post.countByUser(userId);
            }


            //const totalPosts = await Post.count(); // Get total count for pagination info

            res.status(200).json({
                message: 'Posts retrieved successfully',
                data: posts,
                pagination: {
                    currentPage: page,
                    pageSize: pageSize,
                    totalPosts: totalPosts,
                    totalPages: Math.ceil(totalPosts / pageSize)
                }
            });
        } catch (err) {
            console.error('Error fetching posts:', err);
            res.status(500).json({ message: 'Error fetching posts', error: err.message });
        }
    }

    static async getPostById (req, res) {
        const postId = req.params.post_id;
        try {
            const post = await Post.getById(postId);

            if (!post) {
                return res.status(404).json({ message: 'Post not found' });
            }

            res.status(200).json({
                message: 'Post retrieved successfully',
                data: post
            });
        } catch (err) {
            console.error('Error fetching post:', err);
            res.status(500).json({ message: 'Error fetching post', error: err.message });
        }
    }


    static async getCommentsByPostId (req, res) {
        const postId = req.params.post_id;

        try {
            const comments = await Post.getComments(postId);

            res.status(200).json({
                message: 'Comments retrieved successfully',
                data: comments
            });
        } catch (err) {
            console.error('Error fetching comments:', err);
            res.status(500).json({ message: 'Error fetching comments', error: err.message });
        }
    }


    static async createComment  (req, res) {
        const postId = req.params.post_id;
        const { content } = req.body;
        const authorId = req.session.user.id; 

        if (!content) {
            return res.status(400).json({ message: 'Content is required' });
        }

        try {
            const post = await Post.getById(postId);
            if (post.locked) {
                return res.status(403).send({ error: 'This post is locked. You cannot create comment.' });
            }
            
            const result = await Post.createComment(postId, authorId, content);
            AuthController.onPostComment(postId);
            res.status(201).json({ message: 'Comment created successfully', commentId: result.insertId });
        } catch (err) {
            console.error('Error creating comment:', err);
            res.status(500).json({ message: 'Error creating comment', error: err.message });
        }
    }


    static async getCategoriesByPostId  (req, res) {
        const postId = req.params.post_id;

        try {
            const categories = await Post.getCategories(postId);

            if (categories.length === 0) {
                return res.status(404).json({ message: 'No categories found for this post' });
            }

            res.status(200).json({
                message: 'Categories retrieved successfully',
                data: categories
            });
        } catch (err) {
            console.error('Error fetching categories:', err);
            res.status(500).json({ message: 'Error fetching categories', error: err.message });
        }
    }

    static async getLikesByPostId (req, res) {
        const postId = req.params.post_id;

        try {
            const likes = await Post.getLikes(postId);

            res.status(200).json({
                message: 'Likes retrieved successfully',
                data: likes
            });
        } catch (err) {
            console.error('Error fetching likes:', err);
            res.status(500).json({ message: 'Error fetching likes', error: err.message });
        }
    }

    static async createPost (req, res) {
        upload(req, res, async (err) => {
            if (err) {
                return res.status(500).json({ message: 'Error uploading image', error: err.message });
            }

            const { title, content, categories } = req.body;
            const authorId = req.session.user.id; 

            if (!title || !content || !categories) {
                return res.status(400).json({ message: 'Title, content, and categories are required' });
            }

            try {
                const image = req.file ? req.file.filename : null; 

                const postResult = await Post.createPost(authorId, title, content, image);

                const postId = postResult.insertId;
                console.log(postId);

                for (const categoryId of categories) {
                    await Post.addPostCategory(postId, categoryId);
                }

                res.status(201).json({ message: 'Post created successfully', postId: postId });
            } catch (err) {
                console.error('Error creating post:', err);
                res.status(500).json({ message: 'Error creating post', error: err.message });
            }
        });
    }

    static async createLike (req, res) {
        const postId = req.params.post_id;
        const { type } = req.body; 
        const authorId = req.session.user.id; 

        if (!type || (type !== 'like' && type !== 'dislike')) {
            return res.status(400).json({ message: 'Invalid type. It must be either "like" or "dislike".' });
        }

        try {
            const post = await Post.getById(postId);
            if (post.locked) {
                return res.status(403).send({ error: 'This post is locked. You cannot create like.' });
            }
            // Check if the user has already liked/disliked the post
            const existingLike = await Post.findLikeByAuthorAndPost(authorId, postId);
            if (existingLike) {
                return res.status(400).json({ message: 'You have already liked or disliked this post.' });
            }
            const result = await Post.createLike(authorId, postId, type);

            res.status(201).json({ message: 'Like added successfully', likeId: result.insertId });
        } catch (err) {
            console.error('Error creating like:', err);
            res.status(500).json({ message: 'Error creating like', error: err.message });
        }
    }

    static async updatePost (req, res) {
        const postId = req.params.post_id;
        const userRole = req.session.user.role;
        const { title, content, categories, active } = req.body;
        const authorId = req.session.user.id; 
        console.log(active);
        try {
            const post = await Post.getById(postId);
            if (post.locked) {
                return res.status(403).send({ error: 'This post is locked. You cannot update post.' });
            }
            if (!post) {
                return res.status(404).json({ message: 'Post not found.' });
            }

            if (userRole == 'admin') {
                const updatedPostAdmin = await Post.updateByAdmin(postId, active);
                if (categories) {
                    await Post.updatePostCategories(postId, categories);
                }
                res.status(200).json({ message: 'Post updated successfully by Admin', postId });
                return;
            }

            if (post.author_id !== authorId ) {
                return res.status(403).json({ message: 'You are not authorized to update this post.' });
            }

            // Update the post (title, content, and categories can be optional)
            const updatedPost = await Post.updateById(postId, title, content);

            // Update categories if provided
            if (categories) {
                await Post.updatePostCategories(postId, categories);
            }

            AuthController.onPostUpdate(postId);

            res.status(200).json({ message: 'Post updated successfully', postId });
        } catch (err) {
            console.error('Error updating post:', err);
            res.status(500).json({ message: 'Error updating post', error: err.message });
        }
    }

    static async deletePost (req, res) {
        const postId = req.params.post_id;
        const userId = req.session.user.id; 

        try {
            // Fetch the post to check ownership
            const post = await Post.getById(postId);
            if (post.locked) {
                return res.status(403).send({ error: 'This post is locked. You cannot delete post.' });
            }
            if (!post) {
                return res.status(404).json({ message: 'Post not found.' });
            }

            console.log(req.session.user.role)
            if (post.author_id !== userId || req.session.user.role !== 'admin') {
                return res.status(403).json({ message: 'You are not authorized to delete this post.' });
            }

            await Post.deletePostById(postId);

            res.status(200).json({ message: 'Post deleted successfully.' });
        } catch (err) {
            console.error('Error deleting post:', err);
            res.status(500).json({ message: 'Error deleting post', error: err.message });
        }
    }

    static async deleteLike (req, res) {
        const postId = req.params.post_id;
        const userId = req.session.user.id; 

        try {
            const post = await Post.getById(postId);
            if (post.locked) {
                return res.status(403).send({ error: 'This post is locked. You cannot delete like.' });
            }
            
            const like = await Post.findLikeByAuthorAndPost(userId, postId);

            if (!like) {
                return res.status(404).json({ message: 'Like not found.' });
            }

            await Post.deleteLikeById(like.id);

            res.status(200).json({ message: 'Like deleted successfully.' });
        } catch (err) {
            console.error('Error deleting like:', err);
            res.status(500).json({ message: 'Error deleting like', error: err.message });
        }
    }

    static async getPostsSort (req, res) {
        console.log("hello")
        try {
            // Default to sorting by 'likes' if the sort parameter is missing or incorrect
            const sortParam = req.query.sort ? req.query.sort.trim().toLowerCase() : null;
            const sort = sortParam === 'date' ? 'date' : 'likes';
            
            console.log(`Query param (sort): ${sortParam}`); 
            console.log(`Sorting by: ${sort}`); 
            const posts = await Post.getSortedPosts(sort);
            res.status(200).json(posts);
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: 'An error occurred while retrieving posts.' });
        }
    }

    static async getFilteredPosts  (req, res) {
        try {
            // Extract filter parameters from the request query
            const category = req.query.category; 
            const startDate = req.query.start_date; 
            const endDate = req.query.end_date; 
            const status = req.query.status ? req.query.status.trim().toLowerCase() : null; 

            const posts = await Post.getFilteredPosts({ category, startDate, endDate, status });

            res.status(200).json(posts);
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: 'An error occurred while filtering posts.' });
        }
    }

    static async lockPostById (req, res) {
        const postID = req.params.post_id;
        const { lock } = req.body;
        const authorId = req.session.user.id; 
        const userRole = req.session.user.role;
        console.log(postID);
        console.log('Comment ID:', postID);

            // Validate input
            if (typeof lock === 'undefined') {
                return res.status(400).json({ message: 'Lock status is required to update the comment.' });
            }
        if (!lock ) {
            return res.status(400).json({ message: 'Content/status is required to update the comment.' });
        }

        try {
            // Check if the comment belongs to the logged-in user
            const post = await Post.getById(postID);
            if (!post ) {
                return res.status(404).json({ message: 'Comment not found.' });
            }
            
            if (post.author_id !== authorId && userRole !== 'admin') {
                return res.status(403).json({ message: 'You do not have permission to lock this comment.' });
            }
            
            // Update the comment's content
            await Post.lockPost(postID, lock);

            res.status(200).json({ message: 'Post locked successfully' });
        } catch (err) {
            console.error('Error locking comment:', err);
            res.status(500).json({ message: 'Error locking comment', error: err.message });
        }
    }
}

module.exports = PostController;