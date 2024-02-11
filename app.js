const express = require("express");
const app = express();
const mongoose = require('mongoose');
const path = require("path"); 
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');

const MONGO_URL = 'mongodb://localhost:27017/myweb';

function asyncWrap(fn) {
    fn(req, res, next).catch((err) => next(err));
}

main().then(() => {
    console.log('Connected to MongoDB');
})
.catch(err => {
    console.error('Error connecting to MongoDB', err);
});

async function main() {
    await mongoose.connect(MONGO_URL);
}

app.listen(8080, () => {
});

app.use(express.static(path.join(__dirname, "public/CSS")));
app.use(express.static(path.join(__dirname, "public/JS")));
app.use(express.static(path.join(__dirname, "public/img")));
app.use(express.urlencoded({ extended: true }));
app.engine('ejs', ejsMate);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

const sessionOption = {
    secret: "superstar",
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 12,
        maxAge: 1000 * 60 * 60 * 12,
    },
};

app.use(session(sessionOption));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    req.time = new Date(Date.now()).toString();
    console.log(req.time);
    next();
});

app.get('/', (req, res) => {
    res.render("index.ejs");
});

app.get("/demouser", async (req, res) => {
    let fakeUser = new User({ 
        email: "abcd6@gmail.com",
        username: "abcd6"
    });
    res.send(await User.register(fakeUser, "123456"));
});

app.get('/home', (req, res) => {
    res.render("index.ejs");
});

app.get('/about', (req, res) => {
    res.render("about.ejs");
});

app.get('/education', (req, res) => {
    res.render("education.ejs");
});

app.get('/skills', (req, res) => {
    res.render("skills.ejs");
});

app.get('/contact', (req, res) => {
    res.render("contact.ejs");
});

app.get('/login', (req, res) => {
    res.render("login.ejs");
});

app.get('/signup', (req, res) => {
    res.render("signup.ejs");
});

app.post("/signup", async (req, res) => {
    let { name, email, password, phone_no } = req.body;
    const newUser = new User({ name, email, phone_no });
    const registeredUser = await User.register(newUser, password);
    console.log(registeredUser);
    res.redirect('/login');
});

app.all("*", (req, res, next) => {
    res.status(404).render("404.ejs");
});