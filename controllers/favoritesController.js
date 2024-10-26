const FavoritePost = require('../models/Favorite');

exports.addPostToFavorites = async (req, res) => {
    const userId = req.session.user.id;  
    const postId = req.params.post_id;

    try {
        await FavoritePost.addFavorite(userId, postId);
        res.status(200).json({ message: 'Post added to favorites.' });
    } catch (err) {
        console.error('Error adding post to favorites:', err);
        res.status(500).json({ message: 'Failed to add post to favorites.', error: err.message });
    }
};

// Get all favorite posts for the user
exports.getFavoritePosts = async (req, res) => {
    const userId = req.session.user.id;   

    const page = parseInt(req.query.page) || 1; 
    const limit = parseInt(req.query.limit) || 10; 

    try {
        const { posts, totalPosts } = await FavoritePost.getPaginatedPosts(page, limit, userId);
        
        const totalPages = Math.ceil(totalPosts / limit);

        res.status(200).json({
            posts,
            pagination: {
                totalPosts,
                totalPages,
                currentPage: page,
                postsPerPage: limit
            }
        });
    } catch (err) {
        console.error('Error fetching paginated posts:', err);
        res.status(500).json({ message: 'Failed to fetch posts.', error: err.message });
    }
};

exports.removePostFromFavorites = async (req, res) => {
    const userId = req.session.user.id;
    const postId = req.params.post_id;   

    try {
        await FavoritePost.removePostFromFavorites(userId, postId);
        res.status(200).json({ message: 'Post removed from favorites successfully.' });
    } catch (err) {
        console.error('Error removing post from favorites:', err);
        res.status(500).json({ message: 'Failed to remove post from favorites.', error: err.message });
    }
};
