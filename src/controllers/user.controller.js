const User = require("../models/user.model");
const OTP = require("../models/otp.model");
const { successHandler, errorHandler } = require("../utils/responseHandler");
const getMessage = require("../utils/message");
const dayjs = require("dayjs");
const { createAuthResponse } = require("../utils/authHelper");
const { hashPassword, comparePassword } = require("../utils/passwordHelper");
const crypto = require("crypto");
const { uploadFiles } = require("../utils/upload");
//user generate otp
exports.generateOTP = async (req, res) => {
  const { mobileNo } = req.body;
  try {
    let userData = await User.findOne({ mobileNo });
    // let otp = Math.floor(100000 + Math.random() * 900000);
    let otp = 123456;
    const expiresAt = dayjs().add(5, "minute");
    if (!userData) {
      userData = await User.create({ mobileNo });
    }

    await OTP.findOneAndUpdate(
      { mobileNo },
      { otp, expiresAt },
      { upsert: true, new: true }
    );

    return successHandler({
      res,
      statusCode: 200,
      message: getMessage("M001"),
    });
  } catch (err) {
    return errorHandler({
      res,
      statusCode: 500,
      message: err.message,
    });
  }
};

//user verify otp
exports.verifyOTP = async (req, res) => {
  try {
    const { mobileNo, otp } = req.body;

    if (!mobileNo || !otp) {
      return errorHandler({
        res,
        statusCode: 400,
        message: getMessage("M002"),
      });
    }
    const OTPRecord = await OTP.findOne({ mobileNo });
    if (!OTPRecord) {
      return errorHandler({
        res,
        statusCode: 400,
        message: getMessage("M004"),
      });
    }
    if (dayjs().isAfter(OTPRecord.expiresAt)) {
      await OTP.deleteOne({ mobileNo });
      return errorHandler({
        res,
        statusCode: 400,
        message: getMessage("M005"),
      });
    }
    if (OTPRecord.otp !== otp) {
      return errorHandler({
        res,
        statusCode: 400,
        message: getMessage("M003"),
      });
    }
    await OTP.deleteOne({ mobileNo });
    const user = await User.findOne({ mobileNo });
    const authResponse = await createAuthResponse(user, res);
    return successHandler({
      res,
      data: authResponse,
      statusCode: 200,
      message: getMessage("M006"),
    });
  } catch (err) {
    return errorHandler({
      res,
      statusCode: 500,
      message: err.message,
    });
  }
};

//user refresh token
exports.refreshAuthToken = async (req, res) => {
  try {
    const { mobileNo } = req.body;
    const refreshToken = req.cookies.refreshToken;

    if (!mobileNo || !refreshToken) {
      return errorHandler({
        res,
        statusCode: 400,
        message: getMessage("M007"),
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    if (!decoded || decoded.id !== mobileNo) {
      return errorHandler({
        res,
        statusCode: 403,
        message: getMessage("M008"),
      });
    }

    let user = await User.findOne({ mobileNo });
    if (!user) {
      return errorHandler({
        res,
        statusCode: 404,
        message: getMessage("M002"),
      });
    }

    const newAuthToken = jwt.sign(
      { id: user.id },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "15m",
      }
    );

    user.lastTokenIssuedAt = dayjs();
    await user.save();

    res.cookie("authToken", newAuthToken, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000,
      secure: process.env.NODE_ENV === "production",
    });

    return successHandler({
      res,
      statusCode: 200,
      data: {
        token: newAuthToken,
        user: {
          id: user.id,
          mobileNo: user.mobileNo,
          email: user.email,
          role: user.role,
        },
      },
      message: getMessage("M010"),
    });
  } catch (err) {
    return errorHandler({
      res,
      statusCode: 500,
      message: err.message,
    });
  }
};

// Create Admin User
exports.createAdminUser = async (req, res) => {
  try {
    const { name, email, password, mobileNo } = req.body;

    const salt = crypto.randomBytes(16).toString("hex");
    const encryptedPassword = await hashPassword(password, salt);
    const filter = { email };
    if (mobileNo) filter.mobileNo = mobileNo;
    const userAlreadyExists = await User.findOne(filter);

    if (userAlreadyExists) {
      return errorHandler({
        res,
        statusCode: 400,
        message: getMessage("M012"),
      });
    }
    await User.create({
      name,
      email,
      password: encryptedPassword,
      salt,
      role: "admin",
      mobileNo,
    });

    const user = await User.findOne(filter, {
      _id: 0,
      __v: 0,
      password: 0,
      salt: 0,
    });

    return successHandler({
      res,
      data: user,
      statusCode: 200,
      message: getMessage("M009"),
    });
  } catch (err) {
    return errorHandler({
      res,
      statusCode: 500,
      message: err.message,
    });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorHandler({
        res,
        statusCode: 400,
        message: getMessage("M002"),
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return errorHandler({
        res,
        statusCode: 400,
        message: getMessage("M002"),
      });
    }

    const isPasswordValid = await comparePassword(
      password,
      user.password,
      user.salt
    );
    if (!isPasswordValid) {
      return errorHandler({
        res,
        statusCode: 400,
        message: getMessage("M003"),
      });
    }

    const authResponse = await createAuthResponse(user, res);
    return successHandler({
      res,
      data: authResponse,
      statusCode: 200,
      message: getMessage("M006"),
    });
  } catch (err) {
    return errorHandler({
      res,
      statusCode: 500,
      message: err.message,
    });
  }
};

// Logout
exports.logout = async (req, res) => {
  try {
    res.clearCookie("authToken");
    return successHandler({
      res,
      statusCode: 200,
      message: getMessage("M011"),
    });
  } catch (err) {
    return errorHandler({
      res,
      statusCode: 500,
      message: err.message,
    });
  }
};

//get profile details
exports.profile = async (req, res) => {
  try {
    const { _id } = req.user;
    const userDetails = await User.findOne(
      { _id },
      {
        password: 0,
        isActive: 0,
        salt: 0,
        __v: 0,
      }
    );
    if (!userDetails) {
      return errorHandler({
        res,
        statusCode: 400,
        message: getMessage("M002"),
      });
    }
    return successHandler({
      res,
      data: userDetails,
      statusCode: 200,
      message: getMessage("M013"),
    });
  } catch (err) {
    return errorHandler({
      res,
      statusCode: 500,
      message: err.message,
    });
  }
};

//update profile
exports.updateProfile = async (req, res) => {
  try {
    const { _id } = req.user;
    const { name, email, mobileNo, password } = req.body;
    const payload = { name, email, mobileNo };
    if (password) {
      const salt = crypto.randomBytes(16).toString("hex");
      const encryptedPassword = await hashPassword(password, salt);
      payload.password = encryptedPassword;
      payload.salt = salt;
    }

    const userDetails = await User.findOneAndUpdate(
      { _id },
      { name, email, mobileNo },
      { new: true }
    );
    if (!userDetails) {
      return errorHandler({
        res,
        statusCode: 400,
        message: getMessage("M002"),
      });
    }
    return successHandler({
      res,
      data: userDetails,
      statusCode: 200,
      message: getMessage("M014"),
    });
  } catch (err) {
    return errorHandler({
      res,
      statusCode: 500,
      message: err.message,
    });
  }
};

exports.uploadKYCDocument = async (req, res) => {
  try {
    const { _id } = req.user;
    const { id, name } = req.body;
    const files = req.files;
    const allowedFields = ["frontPhoto", "backPhoto"];

    // Save files
    const savedFiles = await uploadFiles(
      files,
      allowedFields,
      path.join(__dirname, "../docs/uploads")
    );

    // Update user KYC document data
    const updatedUser = await User.findOneAndUpdate(
      { _id },
      {
        kycDocument: {
          id,
          name,
          frontPhoto: savedFiles.frontPhoto,
          backPhoto: savedFiles.backPhoto,
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      return errorHandler({
        res,
        statusCode: 400,
        message: "User not found or update failed",
      });
    }

    return successHandler({
      res,
      statusCode: 200,
      message: "KYC document uploaded successfully",
      data: updatedUser,
    });
  } catch (error) {
    return errorHandler({
      res,
      statusCode: 500,
      message: error.message,
    });
  }
};
