const mongoose = require("mongoose");

const minigameSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true,
  },
  announcementId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Announcement",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  game: {
    type: String,
    enum: ["CIM Wordle", "Flappy CIM"],
    required: true,
  },
  playedAt: {
    type: Date,
    default: Date.now,
  },
  stats: {
    result: {
      type: String,
      enum: ["win", "lose"],
      required: true,
    },
    points: {
      type: Number,
      default: 0,
    },
    CIMWordle: {
      guesses: { type: Number, default: 0 },
    },
    FlappyCIM: {
      tries: { type: Number, default: 0 },
    },
  },
});

const Minigame = mongoose.model("Minigame", minigameSchema);

module.exports = Minigame;
