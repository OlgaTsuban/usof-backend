const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const isAuthenticated = require('../middleware/authMiddleware');
const router = express.Router();


// Register route
router.post(
    '/register',
    [
        body('login').notEmpty().withMessage('Login is required'),
        body('email').isEmail().withMessage('Valid email is required'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
        body('passwordConfirmation').custom((value, { req }) => value === req.body.password)
    ],
    authController.register
);

// Login route
router.post(
    '/login',
    [
        body('login').notEmpty().withMessage('Login is required'),
        body('email').isEmail().withMessage('Valid email is required'),
        body('password').notEmpty().withMessage('Password is required')
    ],
    authController.login
);

router.post('/logout',isAuthenticated, authController.logout);
router.post('/password-reset', authController.sendResetLink);
router.post('/password-reset/:confirm_token', authController.confirmNewPassword);
router.get('/confirm-email', authController.confirmEmail);

module.exports = router;
