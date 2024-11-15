const mongoose = require("mongoose");

const MinigameShopItemSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      auto: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    picture: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const MinigameShopItem = mongoose.model(
  "MinigameShopItem",
  MinigameShopItemSchema
);

module.exports = MinigameShopItem;
