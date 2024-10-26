exports.isAdmin = (req, res, next) => {
    console.log(req.session.user);
    if (req.session.user && req.session.user.role === 'admin') {
        return next();  
    }
    return res.status(403).json({ message: 'Admin access only' });  
};