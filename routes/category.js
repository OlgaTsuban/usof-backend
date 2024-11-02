const express = require('express');
const router = express.Router();

const isAuthenticated = require('../middleware/authMiddleware');
const categoriesController = require('../controllers/categoriesController');
const { isAdmin } = require('../middleware/userMiddleware');
/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *       401:
 *         description: Unauthorized
 */
router.get('/', isAuthenticated, categoriesController.getAllCategories);
router.get('/:category_id',isAuthenticated, categoriesController.getCategoryById);
router.get('/:category_id/posts',isAuthenticated, categoriesController.getPostsByCategoryId);
router.post('/',isAdmin, categoriesController.createCategory);
router.patch('/:category_id', isAdmin, categoriesController.updateCategory);
router.delete('/:category_id', isAdmin, categoriesController.deleteCategory);

module.exports = router;