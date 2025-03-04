const express = require("express");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.SECRET_KEY || "default_secret_key";  

// Dummy Users
const Users = [{ id: 1, username: "admin", password: "P@$$W0rd" }];

// first request 
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = Users.find((u) => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ message: "Invalid Credentials" });
  }

  const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: "1h" });

  res.json({ token });
});

// **Middleware to Verify JWT**
const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(403).json({ message: "Access is denied. You cannot login." });
  }

  const token = authHeader.split(" ")[1];    // Extract the actual token after "Bearer"

  
  console.log(token)
  

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid Token" });
    }

    req.user = decoded;
    next();
  });
};

// **Protected Route (Dashboard)** // ** second request **
app.get("/dashboard", verifyToken, (req, res) => {
  res.json({
    message: `Welcome ${req.user.username}, this is a dashboard route or path.`,
  });
});

// **Start Server**
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
