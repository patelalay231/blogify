const Router = require("express");
const multer = require("multer");
const path = require("path");
const User = require("../models/user.schema");
const Comment = require("../models/comment.schema");
const Blog = require("../models/blog.schema");
const router = Router();

const storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,path.resolve(`./public/uploads/`));
    },
    filename: function(req,file,cb){
        const filename = `${Date.now()}-${file.originalname}`;
        cb(null,filename);
    },
})

const upload = multer({storage : storage}); 

router.get('/',async (req,res) => {
    const allBlogs = await Blog.find({});
    return res.render('home',{
        user: req.user,
        blogs: allBlogs
    });
});

router.get('/blog/:id',async (req,res) => {
    const blog = await Blog.findById(req.params.id);
    const author = await User.findById(blog.createdBy);
    const comments = await Comment.find({ blogId: blog._id })
    .populate('userId')
    .sort({ createdAt: -1 }); // Sort comments in descending order by createdAt timestamp
    return res.render('viewBlog',{
        user: req.user,
        blog: blog,
        author:author,
        comments : comments,
    });
});

router.get('/addBlog',(req,res) => {
    return res.render("addBlog",{user: req.user,});
}); 

router.post('/addBlog',upload.single('coverImage'),async (req,res) => {
    const {title,content,description} = req.body;
    const blog  = await Blog.create({
        title : title,
        body : content,
        description :description,
        createdBy : req.user._id,
        coverImageUrl : `uploads/${req.file.filename}`
    })
    return res.redirect(`blog/${blog._id}`);
});

router.get('/publishedBlog',async (req,res) => {
    const blogs = await Blog.find({createdBy:req.user._id});
    return res.render("publishedBlogs",{blogs:blogs,user: req.user,});
});

router.post('/comment/:id',async(req,res)=>{
    const blogId = req.params.id;
    const {comment} = req.body;
    await Comment.create({
        body : comment,
        userId: req.user._id,
        blogId : blogId
    });
    return res.redirect(`/blog/${blogId}`);
});
module.exports = router;