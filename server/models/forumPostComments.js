const mongoose = require("mongoose");
const { Schema } = mongoose;

const forumPostCommentsSchema = new Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true,
  },
  forumPostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ForumPost",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const forumPostComments = mongoose.model(
  "ForumPostComments",
  forumPostCommentsSchema
);

module.exports = forumPostComments;
