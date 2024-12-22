const { Schema, model } = require("mongoose");

const resultSchema = new Schema({
  acceptedUser: {
    matchStatus: {
      type: String,
      enum: ["WON", "LOSS", "CANCELLED"],
    },
    screenShot: {
      type: String,
    },
    cancellationReason: {
      type: String,
    },
  },
  createdUser: {
    matchStatus: {
      type: String,
      enum: ["WON", "LOSS", "CANCELLED"],
    },
    screenShot: {
      type: String,
    },
    cancellationReason: {
      type: String,
    },
  },
});

const battleSchema = new Schema(
  {
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    roomNo: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["OPEN", "PLAYING", "CLOSED"],
      default: "OPEN",
    },
    entryFee: {
      type: Number,
      required: true,
    },
    winnerAmount: {
      type: Number,
    },
    acceptedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    matchStatus: {
      type: String,
      enum: ["COMPLETED", "PENDING"],
      default: "PENDING",
    },
    isBattleRequestAccepted: {
      type: Boolean,
      default: false,
    },

    paymentStatus: {
      type: String,
      enum: ["PENDING", "COMPLETED"],
      default: "PENDING",
    },
    winner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    loser: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    resultUpatedBy: resultSchema,
  },
  {
    timestamps: true,
  }
);

const Battle = model("battle", battleSchema);

module.exports = Battle;
