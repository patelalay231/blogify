const { Schema,model } = require('mongoose');

const blogSchema = new Schema({
    title : {
        type : String,
        required : true,
    },
    description:{
        type: String,
        required: true,
    },
    body: {
        type : String,
        required : true,
    },
    coverImageUrl:{
        type : String,
        default : 'images/defaultBlog.png',
    },
    status : {
        type : String,
        enum : ["PUBLISHED","DRAFT"],
        default : "PUBLISHED",
    },
    createdBy:{
        type:Schema.Types.ObjectId,
        ref:"user",
    },
    viewsCount:{
        type: Number,
        default : 0
    },
    likes: [{ 
        type: Schema.Types.ObjectId, 
        ref: 'user',
    }],
    dislikes: [{
         type: Schema.Types.ObjectId,
          ref: 'user' 
    }],
},{
    timestamps: true,
});

const Blog = model("blog",blogSchema);

module.exports = Blog;