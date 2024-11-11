const mongoose = require("mongoose");

const friendRequestSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  recipient: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("FriendRequest", friendRequestSchema);
