const express = require("express");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.SECRET_KEY || "your_secret_key"; // Use environment variables for security

// Dummy user data (Replace with Database in production)
const users = [
  { id: 1, username: "admin", password: "password123" }
];

// **Generate JWT Token**
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Find user in the dummy database
  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // Generate JWT Token
  const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, {
    expiresIn: "1h" // Token expires in 1 hour
  });

  res.json({ token });
});

// **Middleware to verify JWT Token**
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];
  
  if (!token) {
    return res.status(403).json({ message: "Access denied. No token provided." });
  }

  jwt.verify(token.split(" ")[1], SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
    req.user = decoded;
    next();
  });
};

// **Protected Route**
app.get("/dashboard", verifyToken, (req, res) => {
  res.json({ message: `Welcome ${req.user.username}, this is a protected route!` });
});

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
