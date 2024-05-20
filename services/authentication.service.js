const JWT = require('jsonwebtoken');

const SECRET = "G8%SF12#F&$?WD";

function createTokenForUser(user){
    const payload = {
        _id : user._id,
        name : user.name,
        email: user.email,
        profileImageUrl: user.profileImageUrl,
        role: user.role,
    };
    const token = JWT.sign(payload,SECRET);
    return token;
}

function verifyToken(token){
    const payload = JWT.verify(token,SECRET);
    return payload;
}

module.exports = {
    createTokenForUser,
    verifyToken,
};

