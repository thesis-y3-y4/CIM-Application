const mongoose = require("mongoose");

const friendSchema = new mongoose.Schema({
  user1: { type: mongoose.Schema.Types.Mixed, required: true },
  user2: { type: mongoose.Schema.Types.Mixed, required: true },
  friendsSince: { type: Date, default: Date.now, required: true },
});

module.exports = mongoose.model("Friend", friendSchema);
