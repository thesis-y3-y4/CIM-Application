const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true,
  },
  header: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  mediaUrl: {
    type: String,
  },
  contentType: {
    type: String,
  },
  postedBy: {
    type: String,
  },
  communityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Community",
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
  },
  visibility: {
    everyone: { type: Boolean, default: false },
    staff: { type: Boolean, default: false },
    faculty: { type: Boolean, default: false },
    students: { type: Boolean, default: false },
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "scheduled", "expired"],
    default: "pending",
  },
  postingDate: {
    type: Date,
  },
  expirationDate: {
    type: Date,
    required: true,
  },
  minigame: {
    type: String,
    enum: ["CIM Wordle", "Flappy CIM"], // add games soon
    default: null,
  },
  minigameWord: {
    type: String,
    default: null,
  },
  createdAt: {
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

const Announcement = mongoose.model("Announcement", announcementSchema);

module.exports = Announcement;
