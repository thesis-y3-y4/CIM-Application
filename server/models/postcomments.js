const mongoose = require("mongoose");
const { Schema } = mongoose;

const postCommentsSchema = new Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true,
  },

  postId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  }, // Can be either announcement or forum post ID
  postType: {
    type: String,
    required: true,
    enum: ["announcement", "forumPost"],
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
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

const PostComments = mongoose.model("PostComments", postCommentsSchema);

module.exports = PostComments;
