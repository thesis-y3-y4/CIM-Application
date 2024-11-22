const jwt = require("jsonwebtoken");
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;

const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) return res.sendStatus(401);

  const tokenParts = token.split(" ");
  const authToken = tokenParts[1];

  jwt.verify(authToken, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    // console.log("Authenticated user:", req.user);
    next();
  });
};

module.exports = authenticateToken;
