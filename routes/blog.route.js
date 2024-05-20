const Router = require("express");
const multer = require("multer");
const path = require("path");
const User = require("../models/user.schema");
const Comment = require("../models/comment.schema");
const Blog = require("../models/blog.schema");
const {restrictToLoggedinUserOnly} = require("../middlewares/authentication.middleware");
const { error } = require("console");

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

// Homepage 
router.get('/',async (req,res) => {
    const allBlogs = await Blog.find({status: "PUBLISHED"});
    return res.render('home',{
        user: req.user,
        blogs: allBlogs,
    });
});

// display logges user blogs
router.get('/publishedBlog',async (req,res) => {
    const blogs = await Blog.find({createdBy:req.user._id});
    
    return res.render("publishedBlogs",{blogs:blogs,user: req.user,});
});

// View Particular blog
router.get('/blog/:id',async (req,res) => {
    try{
        const blog = await Blog.findById(req.params.id);
        if(blog.status == "DRAFT" && blog.createdBy != req.user._id) throw error;
        if(blog.status == "PUBLISHED"){
            await Blog.findByIdAndUpdate(req.params.id,{
                viewsCount : blog.viewsCount+=1
            });
        }
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
    }
    catch(error){
        return res.render("404",{user:req.user});
    }
});

// create  a blog
router.get('/addBlog',restrictToLoggedinUserOnly,(req,res) => {
    return res.render("addBlog",{user: req.user,});
}); 

router.post('/addBlog',restrictToLoggedinUserOnly,upload.single('coverImage'),async (req,res) => {
    const {title,content,description} = req.body;
    const blog  = await Blog.create({
        title : title,
        body : content,
        description :description,
        createdBy : req.user._id,
        coverImageUrl : `uploads/${req.file.filename}`,
        status : "PUBLISHED",
    })
    return res.redirect(`blog/${blog._id}`);
});


// draft blog 
router.post('/draftBlog',restrictToLoggedinUserOnly,upload.single('coverImage'),async (req,res) => {
    const {title,content,description} = req.body;
    const blog  = await Blog.create({
        title : title,
        body : content,
        description :description,
        createdBy : req.user._id,
        coverImageUrl : `uploads/${req.file.filename}`,
        status : "DRAFT",
    })
    return res.redirect(`/`);
});


// comment 
router.post('/comment/:id',restrictToLoggedinUserOnly,async(req,res)=>{
    try{
        const blogId = req.params.id;
        const blog = await Blog.findById(req.params.id);
        if(blog.createdBy != req.user._id && blog.status == "DRAFT") throw error;
        const {comment} = req.body;
        await Comment.create({
            body : comment,
            userId: req.user._id,
            blogId : blogId
        });
        return res.redirect(`/blog/${blogId}`);
    }
    catch(error){
        return res.render("404",{user:req.user});
    }
});


router.get('/editBlog/:id',restrictToLoggedinUserOnly,async (req,res) => {
    try{
        const blog = await Blog.findById(req.params.id);
        if(blog.createdBy != req.user._id) throw error;
        return res.render("editBlog",{blog:blog,user: req.user});
    }catch(error){
        return res.render("404",{user:req.user});
    }
});


// edit blog
router.post('/editBlog/:id',restrictToLoggedinUserOnly,upload.single('coverImage'),async (req,res) => {
    const {title,body,description ,status} = req.body;

    if(req.file) coverImageUrl = `uploads/${req.file.filename}`;
    else{
        const existingBlog = await Blog.findById(req.params.id);
        coverImageUrl = existingBlog.coverImageUrl;
    }
    const blog  = await Blog.findByIdAndUpdate(req.params.id,{
        title : title,
        body : body,
        description :description,
        coverImageUrl : coverImageUrl,
        status : status
    },{ new: true });
    return res.redirect(`/publishedBlog`);
});


//delete blog
router.get('/deleteBlog/:id',async (req,res) => {
    try{
        const blog = await Blog.findById(req.params.id);
        if(blog.createdBy != req.user._id) throw error;
        await Blog.findByIdAndDelete(req.params.id);
        return res.redirect(`/publishedBlog`);
    }
    catch(error){
        return res.render("404",{user:req.user});
    }
});

// Like a blog
router.post('/likeBlog/:id', async (req, res) => {
    const blog = await Blog.findById(req.params.id);
    if (!blog.likes.includes(req.user._id)) {
        if(blog.dislikes.includes(req.user._id)){
            blog.dislikes.pull(req.user._id);
        }
        blog.likes.push(req.user._id);
        await blog.save();
    }
    res.json({ dislikes: blog.dislikes.length ,likes: blog.likes.length });
});

// Dislike a blog
router.post('/dislikeBlog/:id', async (req, res) => {
        const blog = await Blog.findById(req.params.id);

        if (!blog.dislikes.includes(req.user._id)) {
            blog.dislikes.push(req.user._id);
            if(blog.likes.includes(req.user._id)){
                blog.likes.pull(req.user._id);
            }
            await blog.save();
        }

        res.json({ dislikes: blog.dislikes.length ,likes: blog.likes.length });
});

module.exports = router;