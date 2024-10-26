const express = require('express');
const session = require('express-session');
const app = express();
const routes = require('./routes');


const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const postRoutes = require('./routes/post');
const categoryRoutes = require('./routes/category');
const commentRoutes = require('./routes/comment');
const favRoutes = require('./routes/favorite');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'your_secret_key', 
    resave: false,
    saveUninitialized: false,  
    cookie: {
        httpOnly: true,       
        secure: false,      
        maxAge: 1000 * 60 * 60 * 24 
    }
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/favorites', favRoutes);

// 404 Handler
// app.use((req, res) => {
//     res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
// });

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});