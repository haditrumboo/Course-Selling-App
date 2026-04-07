const jwt = require('jsonwebtoken');


function adminmiddleware(req, res, next) {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ success: false, message: "No token provided" });
        }
       const decoded =  jwt.verify(token, process.env.JWT_ADMIN_SECRET1);
        
            req.adminId = decoded.userId;
            next();
    
    }
    catch (error) {
        res.status(401).json({sucess : false
            ,message : "invalid or expired token"
        })
    };
    
}
  
 module.exports = { adminmiddleware };