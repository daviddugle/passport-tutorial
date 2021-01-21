const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const passportLocal = require("passport-local").Strategy;
const cookieParser = require("cookie-parser");
const bcrypt= require("bcryptjs");
const session = require("express-session");
const bodyParser = require("body-parser");
const User = require("./user");

const app = express();
// PLACE YOUR USERNAME AND PASSWORD HERE//
mongoose.connect( "mongodb+srv://<YOUR_USERNAME_HERE>:<YOUR_PASSWORD_HERE>@cluster0.k8iay.mongodb.net/passport?retryWrites=true&w=majority" , {
    useNewUrlParser: true,
    useUnifiedTopology: true
},
() => {
    console.log("mongoose is connected")
});



const PORT = process.env.PORT || 4000


//Middleware

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.use(cors({
    origin: "http://localhost:3000", //location of the react app we are connecting to
    credentials: true
}))

app.use(session({
    secret: "secretcode",
    resave: true,
    saveUninitialized: true
}))

app.use(cookieParser("secretcode"));
app.use(passport.initialize());
app.use(passport.session());
require("./passportConfig")(passport);

// end of middleware

app.post ("/login", (req, res, next) =>{
    passport.authenticate("local", (err,user,info) =>{
        if (err) throw err;
        if (!user) res.send("no user exists");
        else {
            req.login(user, err => {
                if (err) throw err;
                res.send("successfully authenticated");
                console.log(req.user);
            })
        }
    })(req, res, next);
})

app.post ("/register", (req,res) =>{
    User.findOne({username: req.body.username}, async (err,doc) => {
        if (err) throw err;
        if (doc) res.send("User Already Exists");
        if (!doc){
            const hashedPassword = await bcrypt.hash(req.body.password, 10);

            const newUser = new User({
                username: req.body.username,
                password: hashedPassword
            });
            await newUser.save();
            res.send("User Created");
        }
    })
})

app.get ("/user", (req,res) =>{
    res.send(req.user);
})

app.listen(PORT, () => {
    console.log("server has started")
})