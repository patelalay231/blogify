const express = require('express');
const path = require('path');
const mongoose = require("mongoose");
const cookieParser = require('cookie-parser')

const app = express();
const PORT = 8000;

const userRoute = require("./routes/user.route");
const blogRoute = require("./routes/blog.route");
const {checkForAuthenticationCookie} = require("./middlewares/authentication.middlware");

mongoose.connect("mongodb://localhost:27017/Blogify")
.then(e => console.log("Mongodb is connected"))
.catch(e =>console.log("something happened!!"));

app.set("view engine","ejs");
app.set("views",path.resolve("./views"));

app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(express.urlencoded({extended : false}));
app.use(checkForAuthenticationCookie("token"));

app.use('/',blogRoute);
app.use('/user',userRoute);

app.listen(PORT, ()=>{
    console.log(`Server is started on ${PORT}`);
});