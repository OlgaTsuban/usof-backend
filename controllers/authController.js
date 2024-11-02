const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const nodemailer = require('nodemailer');
const { validationResult } = require('express-validator');
const mail = require('../config/config.json');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const pool = require('../config/db');



// ------------------------------register------------------------------------------
exports.register = async (req, res) => {
    const { login, password, email, fullName } = req.body;
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // Hashing
    const passwordHash = bcrypt.hashSync(password, 10);
    
    console.log(passwordHash);

    try {
        const result = await User.create(login, passwordHash, fullName, email, 'user');
        
        console.log('User successfully created:', result);

        await this.sendConfirmationEmail(result[0].insertId, email);
        return res.status(201).json({ message: 'User registered' });

    } catch (err) {
        console.log('Error during registration:', err);
        return res.status(500).json({ message: 'Error creating user', err });
    }
};

// ------------------------------login------------------------------------------
exports.login = async (req, res) => {
    const { login, email, password } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const user = await User.findByLoginOrEmail(login, email);
        if (!user) {
            return res.status(400).json({ message: 'Invalid login or email' });
        }

        const userData = user[0];

        console.log(userData);
        if (userData.email_verified == 0) {
            return res.status(403).json({ message: 'Email not confirmed' });
        }

        console.log(password);  
        console.log(userData.password_hash);  
        
        const isMatch = await bcrypt.compare(password, userData.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid password' });
        }
        req.session.user = {
            id: userData.id,
            role: userData.role,
            login: userData.login,
            email: userData.email, 
        };
        console.log(req.session);
        req.session.save((err) => {
            if (err) {
                return res.status(500).json({ message: 'Failed to save session' });
            }
            res.status(200).json({ message: 'Logged in successfully' });
        });

    } catch (err) {
        console.log('Error during login:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// ------------------------------logout------------------------------------------
exports.logout = (req, res) => {
    req.session.destroy();

    return res.status(200).json({ message: 'User logged out successfully' });
};

// ------------------------------sendreset------------------------------------------
const resetTokens = {};

exports.sendResetLink = async (req, res) => {
    const { email } = req.body;
    console.log(email);
    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        console.log(user);
        const userData = user[0];
        const resetToken = crypto.randomBytes(32).toString('hex');
        resetTokens[resetToken] = { userId: userData.id, expires: Date.now() + 3600000 };

        const resetLink = `http://localhost:3000/api/auth/password-reset/${resetToken}`;

        const transporter = nodemailer.createTransport({
            host: mail.emailHost,
            port: mail.emailPort,
            secure: mail.emailSecure,
            auth: {
                user: mail.emailUser,
                pass: mail.emailPass,
            },
        });

        const mailOptions = {
            from: mail.emailUser,
            to: email,
            subject: 'Password Reset Request',
            text: `You requested a password reset. Click the link to reset your password: ${resetLink}`,
        };

        transporter.sendMail(mailOptions, (error) => {
            if (error) {
                return res.status(500).json({ message: 'Error sending email', error });
            }
            res.status(200).json({ message: 'Reset link sent to your email' });
        });

    } catch (err) {
        console.error('Error in sending reset link:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// ------------------------------confirm_password--------------------------------------
exports.confirmNewPassword = async (req, res) => {
    const { confirm_token } = req.params;
    const { new_password } = req.body;

    if (!new_password) {
        return res.status(400).json({ message: 'New password is required' });
    }

    try {
        
        const tokenData = resetTokens[confirm_token];
        if (!tokenData || Date.now() > tokenData.expires) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        const passwordHash = await bcrypt.hash(new_password, 10);

        await User.updatePassword(tokenData.userId, passwordHash); 

        delete resetTokens[confirm_token];

        res.status(200).json({ message: 'Password has been reset successfully' });

    } catch (err) {
        console.error('Error in confirming new password:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// ------------------------------create_user_admin--------------------------------------
exports.createUser = async (req, res) => {
    const { login, email, password, role, fullName } = req.body;

    try {
        console.log(email, login, password, role);
        const existingUser = await User.findByEmail(email);
        if (existingUser && existingUser.length > 0) {
            console.log("------------");
            console.log(existingUser);
            return res.status(400).json({ message: 'User with this email already exists' });
        }
        const hashedPassword = bcrypt.hashSync(password, 10);
        console.log(login);

        const newUser = User.create(login,  hashedPassword, fullName, email, role);
        console.log('User successfully created:', newUser);
        res.status(201).json({ message: 'User created successfully'});
    } catch (err) {
        console.error('Error creating user:', err);  // Log the actual error
        res.status(500).json({ message: 'Error creating user', error: err.message || err });
    }
};

// ------------------------------patch_avatar--------------------------------------
exports.uploadAvatar =  async (req, res) => {
    console.log("loging user 267", req.user);
    const userId = req.session.user.id; 
    const avatarFile = req.file;

    if (!avatarFile) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
        
        const avatarPath = path.join(__dirname, '../uploads/avatars', avatarFile.filename);
        const avatarDbPath = `uploads/avatars/${avatarFile.filename}`;
        
        console.log(userId);
        const user = await User.getById(userId);
        console.log(user);
        if (user.profile_picture) {
            
            const previousAvatarPath = user.profile_picture;
            if (fs.existsSync(previousAvatarPath)) {
                try {
                    fs.unlinkSync(previousAvatarPath); 
                    console.log(`Deleted previous avatar: ${previousAvatarPath}`);
                } catch (err) {
                    console.error(`Error deleting previous avatar: ${err}`);
                }
            } else {
                console.log(`Previous avatar not found at: ${previousAvatarPath}`);
            }
        } 
        fs.renameSync(avatarFile.path, avatarPath); 
        
        await User.updateAvatar(userId, avatarDbPath);

        res.status(200).json({ message: 'Avatar uploaded successfully', avatar: avatarFile.filename });
    } catch (err) {
        console.error('Error uploading avatar:', err);
        res.status(500).json({ message: 'Error uploading avatar', error: err.message || err });
    }
};

// --------------------------------------send_notification------------------------
exports.notifySubscribers = async (postId, activityType) => {
    try {
        
        const subscribedUsers = await Subscription.getSubscribedUsers(postId); 
        if (!subscribedUsers.length) {
            console.log('No subscribers for this post.');
            return;
        }

        const emails = await User.getEmailsByUserIds(subscribedUsers);

        const postLink = `http://localhost:3000/api/posts/${postId}`; // Replace with actual post URL
        const activityMessage = activityType === 'update'
            ? `The post you are subscribed to has been updated. You can view it here: ${postLink}`
            : `The post you are subscribed to has been commented on. You can view it here: ${postLink}`;

       
        const transporter = nodemailer.createTransport({
            host: mail.emailHost,
            port: mail.emailPort,
            secure: mail.emailSecure,
            auth: {
                user: mail.emailUser,
                pass: mail.emailPass,
            },
        });

        const mailPromises = emails.map((email) => {
            const mailOptions = {
                from: mail.emailUser,
                to: email,
                subject: `Notification for Post #${postId}`,
                text: activityMessage,
            };

            return transporter.sendMail(mailOptions);
        });

        await Promise.all(mailPromises);
        console.log('Notification emails sent successfully to subscribed users.');

    } catch (err) {
        console.error('Error notifying subscribers:', err);
    }
};

// Assuming a post with ID 5 was commented on
exports.onPostComment = async (postId) => {
    await exports.notifySubscribers(postId, 'comment');
};

// Assuming a post with ID 5 was updated
exports.onPostUpdate = async (postId) => {
    await exports.notifySubscribers(postId, 'update');
};

// ---------------------------confirmation_email-----------------------
exports.sendConfirmationEmail = async (userId, email) => {
    try {
        
        const token = crypto.randomBytes(32).toString('hex');
        const expirationTime = Date.now() + 24 * 60 * 60 * 1000; // Token valid for 24 hours

        console.log(userId);
        console.log(token);

        
        const query = 'INSERT INTO email_verification_tokens (user_id, token, expires_at) VALUES (?, ?, ?)';
        await pool.query(query, [userId, token, new Date(expirationTime)]);

        const confirmationLink = `http://localhost:3000/api/auth/confirm-email?token=${token}`;

        const transporter = nodemailer.createTransport({
            host: mail.emailHost,
            port: mail.emailPort,
            secure: mail.emailSecure,
            auth: {
                user: mail.emailUser,
                pass: mail.emailPass,
            },
        });

       
            const mailOptions = {
                from: mail.emailUser,
                to: email,
                subject: 'Email Confirmation',
                text: `Please confirm your email by clicking on the following link: ${confirmationLink}`,
            };

            
            await transporter.sendMail(mailOptions);
            console.log('Confirmation email sent successfully.');
    } catch (error) {
        console.error('Error sending confirmation email:', error);
    }
};

exports.confirmEmail = async (req, res) => {
    const { token } = req.query;

    try {
        
        const query = 'SELECT user_id, expires_at FROM email_verification_tokens WHERE token = ?';
        const [result] = await pool.query(query, [token]);

        if (result.length === 0) {
            return res.status(400).json({ message: 'Invalid token' });
        }

        const { user_id, expires_at } = result[0];
        if (new Date() > new Date(expires_at)) {
            return res.status(400).json({ message: 'Token expired' });
        }

        const updateQuery = 'UPDATE users SET email_verified = TRUE WHERE id = ?';
        await pool.query(updateQuery, [user_id]);

        const deleteTokenQuery = 'DELETE FROM email_verification_tokens WHERE token = ?';
        await pool.query(deleteTokenQuery, [token]);

        res.status(200).json({ message: 'Email confirmed successfully' });
    } catch (error) {
        console.error('Error confirming email:', error);
        res.status(500).json({ message: 'Server error' });
    }
};