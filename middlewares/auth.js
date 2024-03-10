const jwt = require('jsonwebtoken');
require('dotenv').config();

const secretKey = process.env.JWT_SECRET;

const generateToken = (parentId, admin) => {
    if (!secretKey) {
        throw new Error('JWT_SECRET is not defined in the environment variables.');
    }

    return jwt.sign({ parentId, admin }, secretKey, { expiresIn: '1h' });
};

const verifyToken = (token) => {
    try {
        return jwt.verify(token, secretKey);
    } catch (error) {
        throw new Error('Invalid token');
    }
};

module.exports = {
    generateToken,
    verifyToken
};