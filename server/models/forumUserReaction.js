const mongoose = require("mongoose");

const forumUserReactionSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  forumPostId: {
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

const ForumUserReaction = mongoose.model(
  "ForumUserReaction",
  forumUserReactionSchema
);
module.exports = ForumUserReaction;
