const express = require('express');
const router = express.Router();

const isAuthenticated = require('../middleware/authMiddleware');
const favoriteController = require('../controllers/favoritesController');

router.post('/:post_id',isAuthenticated, favoriteController.addPostToFavorites);
router.get('/',isAuthenticated, favoriteController.getFavoritePosts);
router.delete('/:post_id', isAuthenticated, favoriteController.removePostFromFavorites);

module.exports = router;
