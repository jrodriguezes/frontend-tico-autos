const express = require("express");
const path = require("path");

const app = express();

// Serve static files from the public directory
app.use(express.static(path.join(__dirname)));

app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "login.html"));
});

app.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "register.html"));
});

app.get("/home", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "home.html"));
});

app.get("/stock", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "stock.html"));
});

app.listen(3001, () => {
    console.log("Server is running on port 3001");
});
