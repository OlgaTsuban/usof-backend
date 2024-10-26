-- FK to users
-- Visibility control (status)

USE usof;

CREATE TABLE comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    author_id INT NOT NULL, 
    post_id INT NOT NULL, 
    publish_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    content TEXT NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active', 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

