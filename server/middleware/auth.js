const jwt = require("jsonwebtoken");
const JWT_SECRET =
  "hvdvay6ert72839289()aiyg8t87qt72393293883uhefiuh78ttq3ifi78272jdsds039[]]pou89ywe";
// const JWT_SECRET = process.env.JWT_SECRET;

const authenticateToken = async (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token)
    return res.status(403).send({ status: "error", message: "Token missing" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await userModel.findById(decoded.id);

    // Check if the token is the same as the current session token
    if (user.currentSessionToken !== token) {
      return res.status(401).send({
        status: "error",
        message: "Session expired. Please log in again.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).send({ status: "error", message: "Invalid token" });
  }
};

module.exports = authenticateToken;
