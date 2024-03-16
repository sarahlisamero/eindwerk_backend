const jwt = require('jsonwebtoken');
require('dotenv').config();

const secretKey = process.env.JWT_SECRET;

    const authorizeAdmin = (req, res, next) => {
        const token = req.headers.authorization;
      
        if (!token) {
          return res.status(401).json({
            status: "error",
            message: "No token provided",
          });
        }
      
        // No bearer in token
        const extractToken = token.replace("Bearer ", "");
      
        jwt.verify(extractToken, secretKey, (err, decoded) => {
          if (err) {
            return res.status(401).json({
              status: "error",
              message: "Invalid token",
            });
          }
      
          if (!decoded.admin) {
            return res.status(403).json({
              status: "error",
              message: "Forbidden: User is not an admin",
            });
          }
      
          req.user = decoded; // Attach user details to the request object
      
          next();
        });
      };

module.exports = authorizeAdmin;