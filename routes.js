const express = require('express');
const router = express.Router();

// Import route files
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const postRoutes = require('./routes/post');
const categoryRoutes = require('./routes/category');
const commentRoutes = require('./routes/comment');
const favRoutes = require('./routes/favorite');

// Register the routes with their respective paths
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/posts', postRoutes);
router.use('/categories', categoryRoutes);
router.use('/comments', commentRoutes);
router.use('/favorites', favRoutes);

// Example placeholder route for other features (you can add more later)
router.get('/', (req, res) => {
    res.send('Welcome to the API!');
});

module.exports = router;
