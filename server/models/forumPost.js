const mongoose = require("mongoose");
const Scheme = mongoose.Schema;

const forumPostSchema = new Scheme({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true,
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  communityId: {
    type: String,
    required: true,
  },
  // organizationId: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "Organization",
  // },
  header: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  mediaURL: {
    type: String,
  },
  datePosted: {
    type: Date,
    default: Date.now,
  },
  likes: {
    type: Number,
    default: 0,
  },
  dislikes: {
    type: Number,
    default: 0,
  },
});

const ForumPost = mongoose.model("ForumPost", forumPostSchema);
module.exports = ForumPost;
