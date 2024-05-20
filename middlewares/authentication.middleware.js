const { verifyToken } = require("../services/authentication.service");

function checkForAuthenticationCookie(cookieName){
    return (req,res,next) => {
        const tokenCookieValue = req.cookies[cookieName];
        if(!tokenCookieValue){
            return next();
        }
        try{
            const userPayload = verifyToken(tokenCookieValue);
            req.user = userPayload;
        }
        catch(err){}
        return next();
    };
}

function restrictToLoggedinUserOnly(req,res,next){
    const token = req.cookies.token;
    if(!token) return res.redirect("/user/login");
    next();
}

module.exports = {
    checkForAuthenticationCookie,
    restrictToLoggedinUserOnly
}