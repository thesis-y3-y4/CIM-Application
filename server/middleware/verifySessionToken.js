const jwt = require("jsonwebtoken");
const userModel = require("../models/user");
const mobileUserModel = require("../models/mobileUser");

const verifySessionToken = async (req, res, next) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    console.log(token);
    if (!token) {
      return res
        .status(401)
        .send({ status: "error", message: "Token is missing" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token
    const studentemail = decoded.studentemail;

    console.log("Decoded: ", decoded);
    console.log("Student email: ", studentemail);

    // Search in mobileUserModel first, then userModel
    const user =
      (await mobileUserModel.findOne({ studentemail })) ||
      (await userModel.findOne({ studentemail }));

    if (!user) {
      return res
        .status(404)
        .send({ status: "error", message: "User not found" });
    }

    if (user.currentSessionToken !== token) {
      return res
        .status(401)
        .send({ status: "error", message: "Invalid or expired token" });
    }

    req.user = user; // Attach user data to the request
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error("Error verifying session token:", error);
    return res
      .status(500)
      .send({ status: "error", message: "Internal server error" });
  }
};

module.exports = verifySessionToken;
