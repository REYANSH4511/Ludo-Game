const User = require("../models/user.model");
const getMessage = require("../utils/message");
const { errorHandler } = require("../utils/responseHandler");

exports.applyReferralCode = async (req, res) => {
  try {
    const { referralCode,mobileNo } = req.body;
    const user = await User.findOne({ mobileNo });
    if (!user) {
      return errorHandler({
        res,
        statusCode: 400,
        message: getMessage("M002"),
      });
    }
    if (!referralCode) {
      return errorHandler({
        res,
        statusCode: 400,
        message: getMessage("M020"),
      });
    }
    const data = await User.findOne({
      referalCode: referralCode,
      role: "user",
      mobileNo: { $ne: mobileNo },
    });
  } catch (err) {
    return errorHandler({
      res,
      statusCode: 500,
      message: err.message,
    });
  }
};
