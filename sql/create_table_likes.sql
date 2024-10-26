-- FK to users
-- FK to posts (nullable if like is on comment)
-- FK to comments (nullable if like is on post)
-- Whether it is a like or dislike (type)

USE usof;

CREATE TABLE likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    author_id INT NOT NULL, 
    post_id INT, 
    comment_id INT, 
    publish_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    type ENUM('like', 'dislike') NOT NULL, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE
);
