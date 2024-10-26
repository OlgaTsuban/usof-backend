const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.header('Authorization').replace('Bearer ', '');
    if (!token) return res.status(403).send('Access denied.');

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).send('Invalid token.');
    }
};


const isAuthenticated = (req, res, next) => {
    //console.log(req.session.user);
    if (!req.session.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    
    if (req.session.user.id) {
        
        return next(); // User is logged in, proceed to the next middleware
    } else {
        return res.status(401).json({ message: 'Unauthorized' });
    }
};
module.exports = isAuthenticated;

