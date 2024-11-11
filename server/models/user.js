const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true,
  },
  name: {
    type: String,
    required: true,
  },
  studentemail: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  adminType: {
    type: String,
    required: false,
  },
  position: {
    type: String,
    required: function () {
      return this.adminType === "Organization Officer";
    },
  },
  organization: {
    type: String,
    required: function () {
      return this.adminType === "Organization Officer";
    },
  },
  schoolYear: {
    type: String,
    required: function () {
      return (
        this.adminType === "School Owner" ||
        this.adminType === "President" ||
        this.adminType === "School Executive Admin" ||
        this.adminType === "School Executive Dean" ||
        this.adminType === "Program Head" ||
        this.adminType === "Instructor"
      );
    },
  },
  department: {
    type: String,
    required: function () {
      return (
        this.adminType === "Program Head" || this.adminType === "Instructor"
      );
    },
  },
  profilePicture: {
    type: String,
    required: false,
  },
  //points
  clawMarks: { type: Number, default: 0 },
});

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;
