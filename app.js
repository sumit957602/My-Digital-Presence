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
const { saveRedirectUrl } = require('./middleware.js');

const MONGO_URL = 'mongodb+srv://sumit9523:pniW509R2O7Slibj@cluster0.diwyc0y.mongodb.net/?retryWrites=true&w=majority';

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
    console.log("http://localhost:8080/");
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
    res.locals.currentUser = req.user;
    next();
});

app.get('/', (req, res) => {
    res.render("index.ejs");
});

app.get('/home', (req, res) => {
    res.render("index.ejs");
});

app.get('/about', (req, res) => {
    if (req.isAuthenticated()) {
        res.render("about.ejs");
    } else {
        req.session.redirectUrl = req.originalUrl;
        req.flash('error', 'You must be logged in first!');
        res.redirect('/login');
    }
});

app.get('/education', (req, res) => {
    if (req.isAuthenticated()) {
        res.render("education.ejs");
    } else {
        req.flash('error', 'You must be logged in first!');
        res.redirect('/login');
        req.session.redirectUrl = req.originalUrl;
    }
});

app.get('/skills', (req, res) => {
    if (req.isAuthenticated()) {
        res.render("skills.ejs");
    } else {
        req.flash('error', 'You must be logged in first!');
        res.redirect('/login');
        req.session.redirectUrl = req.originalUrl;
    }
});

app.get('/contact', (req, res) => {
    if (req.isAuthenticated()) {
        res.render("contact.ejs");
    } else {
        req.flash('error', 'You must be logged in first!');
        res.redirect('/login');
        req.session.redirectUrl = req.originalUrl;
    }
});

app.get('/login', (req, res) => {
    res.render("login.ejs");
});

app.get('/signup', (req, res) => {
    res.render("signup.ejs");
});

app.post("/signup", async (req, res) => {
    let { name, username, email, phone_no, password } = req.body;
    const newUser = new User({ name, username, email, phone_no });
    const registeredUser = await User.register(newUser, password);
    res.redirect('/login');
});

app.post('/login', saveRedirectUrl, passport.authenticate('local', 
    { failureFlash: true, failureRedirect: '/login' }), async (req, res) => {
        req.flash('success', 'Welcome !');
        res.redirect(res.locals.redirectUrl || '/home');
});

app.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/home');
    });
});

app.all("*", (req, res, next) => {
    res.status(404).render("404.ejs");
});