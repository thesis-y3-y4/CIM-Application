const mongoose = require("mongoose");

const userReactionSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  announcementId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Announcement",
    required: true,
  },
  reaction: {
    type: String,
    enum: ["like", "dislike"],
    required: true,
  },
  dateReacted: {
    type: Date,
    default: Date.now,
  },
});

const UserReaction = mongoose.model("UserReaction", userReactionSchema);

module.exports = UserReaction;
