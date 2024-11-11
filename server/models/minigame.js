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
    enum: ["CIM Wordle", "NewGame1", "NewGame2"],
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
      guesses: { type: Number, default: null },
    },
    NewGame1: {
      // Add fields specific to NewGame1 here
    },
    NewGame2: {
      // Add fields specific to NewGame2 here
    },
    
  },
});

const Minigame = mongoose.model("Minigame", minigameSchema);

module.exports = Minigame;
