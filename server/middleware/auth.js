const jwt = require("jsonwebtoken");
const JWT_SECRET =
  "hvdvay6ert72839289()aiyg8t87qt72393293883uhefiuh78ttq3ifi78272jdsds039[]]pou89ywe";

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
