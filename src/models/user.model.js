const { Schema, model } = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const kycDocumentSchema = new Schema({
  id: {
    type: String,
    trim: true,
    default: null,
  },
  name: {
    type: String,
    trim: true,
    default: null,
  },
  frontPhoto: {
    type: String, 
    trim: true,
    default: null,
  },
  backPhoto: {
    type: String, 
    trim: true,
    default: null,
  },
});

const userSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      default: "Anonymous Player",
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    mobileNo: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["admin", "user", "superAdmin"],
      default: "user",
    },
    referalCode: {
      type: String,
      trim: true,
    },
    referedBy: {
      type: String,
      trim: true,
    },
    salt: {
      type: String,
      trim: true,
      default: null,
    },
    kycDocument: kycDocumentSchema,
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate a unique referral code for "user" role
userSchema.pre("save", async function (next) {
  if (this.role === "user" && !this.referalCode) {
    const uuidSegment = uuidv4().split("-")[0]; // Use a segment of the UUID
    console.log("uuidSegment", uuidSegment);
    this.referalCode = `REF-${this.mobileNo}-${uuidSegment}`;
  }
  next();
});

const User = model("User", userSchema);

module.exports = User;
