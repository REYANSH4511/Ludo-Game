const { Schema, model } = require("mongoose");

const settingsSchema = new Schema(
  {
    whatsAppLink: {
      type: String,
      trim: true,
      required: true,
    },
    facebookLink: {
      type: String,
      trim: true,
      required: true,
    },
    instagramLink: {
      type: String,
      trim: true,
      required: true,
    },
    telegramLink: {
      type: String,
      trim: true,
      required: true,
    },
    referralAmountPercentage: {
      type: Number,
      required: true,
      default: 2,
    },
  },
  {
    timestamps: true,
  }
);

const Settings = model("settings", settingsSchema);

module.exports = Settings;
