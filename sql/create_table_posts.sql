-- FK to users
-- Post visibility (status)
-- Problem explanation (content)
-- You can store image paths as a comma-separated list or use a separate table
USE usof;

CREATE TABLE posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    author_id INT NOT NULL, 
    title VARCHAR(255) NOT NULL,
    publish_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('active', 'inactive') DEFAULT 'active',
    content TEXT NOT NULL,
    images TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);


CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL UNIQUE, 
    description TEXT 
);

CREATE TABLE post_categories (
    post_id INT NOT NULL,
    category_id INT NOT NULL,
    PRIMARY KEY (post_id, category_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);
