const express = require('express');
const router = express.Router();

const isAuthenticated = require('../middleware/authMiddleware');
const categoriesController = require('../controllers/categoriesController');
const { isAdmin } = require('../middleware/userMiddleware');

router.get('/', isAuthenticated, categoriesController.getAllCategories);
router.get('/:category_id',isAuthenticated, categoriesController.getCategoryById);
router.get('/:category_id/posts',isAuthenticated, categoriesController.getPostsByCategoryId);
router.post('/',isAdmin, categoriesController.createCategory);
router.patch('/:category_id', isAdmin, categoriesController.updateCategory);
router.delete('/:category_id', isAdmin, categoriesController.deleteCategory);

module.exports = router;