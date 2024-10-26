const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const isAuthenticated = require('../middleware/authMiddleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads/avatars/' }); 
const User = require('../models/User');
const router = express.Router();
const { isAdmin } = require('../middleware/userMiddleware');
const pool = require('../config/db');


router.get('/',isAuthenticated, async (req, res) => {
    try {
        const users = await User.getAll(); 
        res.status(200).json(users);  
    } catch (err) {
        res.status(500).json({ message: 'Error retrieving users', err });
    }
});

router.get('/:user_id',isAuthenticated, async (req, res) => {
    const userId = req.params.user_id;
    try {
        const user = await User.getById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user); 
    } catch (err) {
        res.status(500).json({ message: 'Error retrieving user', err });
    }
});

router.post(
    '/',
    isAdmin,  
    [
        body('login').notEmpty().withMessage('Login is required'),
        body('email').isEmail().withMessage('Valid email is required'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
        body('passwordConfirmation').custom((value, { req }) => value === req.body.password)
            .withMessage('Passwords must match'),
        body('role').notEmpty().withMessage('Role is required')  
    ],
    authController.createUser 
);

router.patch(
    '/avatar',
    isAuthenticated, 
    upload.single('avatar'),
    authController.uploadAvatar 
);

// PATCH - Update user data
router.patch('/:user_id', isAuthenticated, async (req, res) => {
    const { user_id } = req.params;
    console.log(user_id);
    const { login, email, fullName } = req.body; 
    const authorId = req.session.user.id;
    const userRole = req.session.user.role;
    try {
        
        const user = await User.getById(user_id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (authorId !== user_id || userRole !== 'admin') {
            return res.status(403).json({ message: 'You are not authorized to update this user.' });
        }
        if (login || email) {
            const existingUser = await User.findByLoginOrEmail(login, email);
            console.log(existingUser);
            if (existingUser.length > 0 && existingUser.id !== user_id) {
                return res.status(400).json({ message: 'Login or email is already used by another user' });
            }
        }

        let updateFields = [];
        let queryParams = [];

        if (login) {
            updateFields.push('login = ?');
            queryParams.push(login);
        }
        if (email) {
            updateFields.push('email = ?');
            queryParams.push(email);
        }
        if (fullName) {
            updateFields.push('full_name = ?');
            queryParams.push(fullName);
        }
        
        queryParams.push(user_id);
        
        if (updateFields.length > 0) {
            const updateQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
            await pool.query(updateQuery, queryParams);
        }

        res.status(200).json({ message: 'User updated successfully', user });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Error updating user', error: error.message });
    }
});


// DELETE - Delete user
router.delete('/:user_id', isAdmin, async (req, res) => {
    const { user_id } = req.params;
    try {
        const user = await User.getById(user_id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        await User.deleteUser(user_id);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
});


module.exports = router;
