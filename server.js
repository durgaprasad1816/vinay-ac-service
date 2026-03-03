
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: "vinaysecret",
    resave: false,
    saveUninitialized: true
}));

app.set("view engine", "ejs");

mongoose.connect(process.env.MONGO_URL || "mongodb://127.0.0.1:27017/vinayAC");

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    role: String
});

const bookingSchema = new mongoose.Schema({
    name: String,
    phone: String,
    serviceType: String,
    problem: String,
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);
const Booking = mongoose.model("Booking", bookingSchema);

User.findOne({ username: "admin" }).then(user => {
    if (!user) {
        User.create({ username: "admin", password: "1234", role: "admin" });
    }
});

app.get("/", (req, res) => res.render("home"));

app.get("/register", (req, res) => res.render("register"));
app.post("/register", async (req, res) => {
    await User.create({ ...req.body, role: "customer" });
    res.redirect("/login");
});

app.get("/login", (req, res) => res.render("login"));
app.post("/login", async (req, res) => {
    const user = await User.findOne(req.body);
    if (!user) return res.send("Invalid credentials");
    req.session.user = user;
    if (user.role === "admin") return res.redirect("/admin");
    res.redirect("/booking");
});

app.get("/booking", (req, res) => res.render("booking"));
app.post("/booking", async (req, res) => {
    await Booking.create(req.body);
    res.send("Booking Submitted Successfully! <a href='/'>Go Home</a>");
});

app.get("/admin", async (req, res) => {
    if (!req.session.user || req.session.user.role !== "admin")
        return res.redirect("/login");
    const bookings = await Booking.find();
    res.render("admin", { bookings });
});

app.listen(PORT, () => console.log("Server running on port " + PORT));
