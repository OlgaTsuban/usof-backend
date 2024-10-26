-- Store hashed password
-- You can add further validation for real name
-- Ensure email is unique
-- Track email verification
-- File path to the profile picture
-- Calculated as the sum of likes/dislikes
-- Default role is 'user'

USE usof;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    login VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL, 
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    profile_picture VARCHAR(255), 
    rating INT DEFAULT 0,
    role ENUM('admin', 'user', 'guest') DEFAULT 'user', 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

ALTER TABLE users
MODIFY profile_picture VARCHAR(255) DEFAULT 'uploads/avatars/default.png';
