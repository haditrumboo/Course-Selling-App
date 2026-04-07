const jwt = require('jsonwebtoken');


function usermiddleware(req, res, next) {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ success: false, message: "No token provided" });
        }
       const decoded =  jwt.verify(token, process.env.JWT_SECRET);
        
            req.userId = decoded.userId;
            next();
    
    }
    catch (error) {
        res.status(401).json({sucess : false
            ,message : "invalid or expired token"
        })
    };
    
}
  
 module.exports = { usermiddleware };