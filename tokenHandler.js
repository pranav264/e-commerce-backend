require("dotenv").config();
const jwt = require("jsonwebtoken");

const tokenHandler = (username, token) => {
    const secret_key = process.env.JWT_SECRET;
    const decoded = jwt.verify(token, secret_key);
    
    if(decoded.username === username) {
        return true;
    }
    else {
        return false;
    }
}

module.exports = tokenHandler;