const mongoose = require("mongoose");
const { Schema } = mongoose;

const organizationSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  schoolYear: {
    type: String,
    required: true,
  },
  semester: {
    type: String,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  mobileMembers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MobileUser",
    },
  ],
  logoUrl: {
    type: String,
    default: null,
  },
});

const Organization = mongoose.model("Organization", organizationSchema);

module.exports = Organization;
