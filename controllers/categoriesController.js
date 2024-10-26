const Category = require('../models/Category');

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.getAllCategories();

        res.status(200).json(categories);
    } catch (err) {
        console.error('Error fetching categories:', err);
        res.status(500).json({ message: 'Error fetching categories', error: err.message });
    }
};

exports.getCategoryById = async (req, res) => {
    const categoryId = req.params.category_id;

    try {
        const category = await Category.getCategoryById(categoryId);

        if (!category) {
            return res.status(404).json({ message: 'Category not found.' });
        }

        res.status(200).json(category);
    } catch (err) {
        console.error('Error fetching category:', err);
        res.status(500).json({ message: 'Error fetching category', error: err.message });
    }
};


exports.getPostsByCategoryId = async (req, res) => {
    const categoryId = req.params.category_id;

    try {
        const posts = await Category.getPostsByCategoryId(categoryId);

        if (posts.length === 0) {
            return res.status(404).json({ message: 'No posts found for this category.' });
        }

        res.status(200).json(posts);
    } catch (err) {
        console.error('Error fetching posts for category:', err);
        res.status(500).json({ message: 'Error fetching posts for category', error: err.message });
    }
};

exports.createCategory = async (req, res) => {
    const { title, description } = req.body;

    if (!title) {
        return res.status(400).json({ message: 'Title is required' });
    }

    try {
        const result = await Category.createCategory(title, description);
        res.status(201).json({ message: 'Category created successfully', categoryId: result.insertId });
    } catch (err) {
        console.error('Error creating category:', err);
        res.status(500).json({ message: 'Error creating category', error: err.message });
    }
};


exports.updateCategory = async (req, res) => {
    const categoryId = req.params.category_id;
    const { title, description } = req.body;

    if (!title && !description) {
        return res.status(400).json({ message: 'At least one field (title or description) is required to update.' });
    }

    try {
        const result = await Category.updateCategory(categoryId, title, description);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Category not found.' });
        }

        res.status(200).json({ message: 'Category updated successfully' });
    } catch (err) {
        console.error('Error updating category:', err);
        res.status(500).json({ message: 'Error updating category', error: err.message });
    }
};

exports.deleteCategory = async (req, res) => {
    const categoryId = req.params.category_id;

    try {
        const result = await Category.deleteCategory(categoryId);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Category not found.' });
        }

        res.status(200).json({ message: 'Category deleted successfully' });
    } catch (err) {
        console.error('Error deleting category:', err);
        res.status(500).json({ message: 'Error deleting category', error: err.message });
    }
};

