USE usof;

-- insert data in users table
INSERT INTO users (login, password_hash, full_name, email, email_verified, profile_picture, rating, role)
VALUES 
('user1', 'hashpassword1', 'John Doe', 'johndoe@example.com', TRUE, 'profile1.jpg', 5, 'admin'),
('user2', 'hashpassword2', 'Jane Smith', 'janesmith@example.com', FALSE, 'profile2.jpg', 3, 'user'),
('user3', 'hashpassword3', 'Alice Johnson', 'alicejohnson@example.com', TRUE, NULL, 4, 'user'),
('user4', 'hashpassword4', 'Bob Lee', 'boblee@example.com', TRUE, 'profile4.jpg', 2, 'guest'),
('user5', 'hashpassword5', 'Charlie Kim', 'charliekim@example.com', FALSE, NULL, 1, 'user'),
('user6', 'hashpassword6', 'Diana Moore', 'dianamoore@example.com', FALSE, 'profile6.jpg', 0, 'admin');

-- insert data in posts table
INSERT INTO posts (author_id, title, content, images, status)
VALUES 
(1, 'Exploring Node.js', 'This post covers the basics of Node.js and its ecosystem.', 'image1.jpg', 'active'),
(2, 'Understanding JavaScript Promises', 'An in-depth guide to JavaScript promises and async programming.', 'image2.jpg', 'active'),
(3, 'CSS Grid Layout Tutorial', 'A complete guide to CSS Grid Layout with examples.', 'image3.jpg', 'active'),
(1, 'Database Optimization Tips', 'Some practical tips on how to optimize your database queries for performance.', 'image4.jpg', 'inactive'),
(6, 'Introduction to REST APIs', 'Learn about REST API architecture and how to build scalable APIs.', 'image5.jpg', 'active');


-- Insert sample values into the comments table
INSERT INTO comments (author_id, post_id, content, status) 
VALUES 
(1, 1, 'This is a comment on post 1 by author 1.', 'active'),
(3, 1, 'Another comment on post 1 by author 2.', 'active'),
(1, 2, 'First comment on post 2 by author 1.', 'active'),
(3, 2, 'Comment on post 2 by author 3.', 'inactive'),
(4, 3, 'A comment on post 3 by author 2.', 'active');

-- Insert likes for posts
INSERT INTO likes (author_id, post_id, comment_id, type)
VALUES 
(1, 1, NULL, 'like'),
(4, 1, NULL, 'dislike'),
(3, 2, NULL, 'like'),
(4, 3, NULL, 'like'),
(6, 2, NULL, 'dislike');

-- Insert likes for comments
INSERT INTO likes (author_id, post_id, comment_id, type)
VALUES 
(1, 1, 1, 'like'),
(4, 2, 2, 'dislike'),
(3, 1, 3, 'like'),
(4, 3, 4, 'like'),
(6, 2, 5, 'dislike');

-- Insert values into the categories table
INSERT INTO categories (title, description)
VALUES 
('Technology', 'Posts related to technology, gadgets, and innovations.'),
('Science', 'Topics covering scientific discoveries, research, and advancements.'),
('Health', 'Posts related to health, fitness, and wellness.'),
('Education', 'Educational content and resources for learning.'),
('Entertainment', 'Posts related to movies, music, games, and other entertainment.'),
('Travel', 'Travel guides, tips, and experiences from around the world.'),
('Food', 'Recipes, food reviews, and culinary tips.');

-- insert into post categories
INSERT INTO post_categories (post_id, category_id)
VALUES
(1, 1),
(1, 3),
(1, 4);

-- Insert test data into subscriptions
INSERT INTO subscriptions (user_id, post_id)
VALUES
    (1, 2), 
    (1, 1),  
    (6, 1),  
    (6, 29),  
    (6, 22),  
    (4, 29),  
    (4, 21);  

