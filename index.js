const express = require('express');
const session = require('express-session');
const app = express();
const routes = require('./routes');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const postRoutes = require('./routes/post');
const categoryRoutes = require('./routes/category');
const commentRoutes = require('./routes/comment');
const favRoutes = require('./routes/favorite');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define Swagger options
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0', // Specify OpenAPI version
        info: {
            title: 'Your API Name',
            version: '1.0.0',
            description: 'API documentation for your project',
            contact: {
                name: 'Your Name or Team',
            },
        },
        components: {
            securitySchemes: {
                sessionAuth: { // A custom name for your session authentication
                    type: 'apiKey', // Use apiKey type for cookie-based session auth
                    in: 'cookie', // The location of the session token (usually cookies)
                    name: 'connect.sid', // The name of your session cookie
                },
            },
        },
        security: [
            {
                sessionAuth: [], // Match the name exactly
            },
        ],
        servers: [
            {
                url: 'http://localhost:3000/', // Correctly structured server
            },
        ],
    },
    apis: ['./routes/*.js'], // Path to your API routes or docs for auto-generation
};

  
  // Initialize swagger-jsdoc
  const swaggerDocs = swaggerJsDoc(swaggerOptions);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
  

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