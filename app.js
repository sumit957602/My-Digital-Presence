const express = require("express");
const app = express();
const mongoose = require('mongoose');
const path = require("path"); 
const ejsMate = require('ejs-mate');

const MONGO_URL = 'mongodb://localhost:27017/myweb';

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

app.use((req, res, next) => {
    req.time = new Date(Date.now()).toString();
    console.log(req.time);
    next();
});

app.get('/', (req, res) => {
    res.render("index.ejs");
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

app.all("*", (req, res) => {
    res.status(404).render("404.ejs");
});