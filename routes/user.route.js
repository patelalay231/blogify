const Router = require("express");
const path = require("path");
const User = require("../models/user.schema");
const router = Router();
const multer = require("multer");

const storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,path.resolve(`./public/profilePicture/`));
    },
    filename: function(req,file,cb){
        const filename = `${req.user._id}-${file.originalname}`;
        cb(null,filename);
    },
})

const upload = multer({storage : storage}); 

router.get('/login',(req,res)=>{
    return res.render("login");
});

router.get('/signup',(req,res)=>{
    return res.render("signup");
});

router.post('/signup',async (req,res)=>{
    const {name,email,password} = req.body;
    await User.create({
        name,
        email,
        password
    });
    return res.redirect("/user/login");
})

router.post('/login',async (req,res)=>{
    const {email,password} = req.body;
    try{
        const token = await User.matchPasswordAndGenerateToken(email,password);
        return res.cookie("token",token).redirect("/");
    }
    catch(err){
        return res.render("login",{
            error: "Incorrect email or password.",
        });
    }
})

router.get('/logout',(req,res)=>{
    return res.clearCookie("token").redirect("/");
})

router.get('/profile',(req,res)=>{
    return res.render("userProfile",{user: req.user});
})

router.post('/profile',upload.single('profilePicture'),async (req,res)=>{
    const {name} = req.body;
    let profileImageUrl;
    if(req.file.filename) profileImageUrl = `profilePicture/${req.file.filename}`;
    else profileImageUrl = 'images/defaultAvtar.png';
    console.log(profileImageUrl);
    const user  = await User.findByIdAndUpdate(req.user._id,{
        name:name,
        profileImageUrl : profileImageUrl
    } ,{ new: true });
    req.user = user;
    return res.clearCookie("token").redirect("/user/login");
})

module.exports = router;