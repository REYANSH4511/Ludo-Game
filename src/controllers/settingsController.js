const Settings = require("../models/settings.model");
const User = require("../models/user.model");
const getMessage = require("../utils/message");
const { errorHandler, successHandler } = require("../utils/responseHandler");

// update social media links
exports.updateSocialMediaLinks = async (req, res) => {
  try {
    const { role } = req.user;
    const { whatsAppLink, facebookLink, instagramLink, telegramLink } =
      req.body;

    if (role === "user") {
      return errorHandler({
        res,
        statusCode: 403,
        message: getMessage("M015"),
      });
    }

    const updateObject = {
      ...(whatsAppLink && { whatsAppLink }),
      ...(facebookLink && { facebookLink }),
      ...(instagramLink && { instagramLink }),
      ...(telegramLink && { telegramLink }),
    };

    if (Object.keys(updateObject).length === 0) {
      return errorHandler({
        res,
        statusCode: 400,
        message: getMessage("M026"),
      });
    }

    const updatedSettings = await Settings.updateOne(
      {},
      { $set: updateObject }
    );

    return successHandler({
      res,
      statusCode: 200,
      message: getMessage("M027"),
      data: updatedSettings,
    });
  } catch (err) {
    return errorHandler({
      res,
      statusCode: 500,
      message: err.message,
    });
  }
};

// update referral amount percentage
exports.updateReferralAmountPercentage = async (req, res) => {
  try {
    const { role } = req.user;
    const { referralAmountPercentage } = req.body;

    if (role === "user") {
      return errorHandler({
        res,
        statusCode: 403,
        message: getMessage("M015"),
      });
    }

    const updateObject = {
      ...(referralAmountPercentage && { referralAmountPercentage }),
    };

    const updatedSettings = await Settings.updateOne(
      {},
      { $set: updateObject }
    );

    return successHandler({
      res,
      statusCode: 200,
      message: getMessage("M028"),
      data: updatedSettings,
    });
  } catch (err) {
    return errorHandler({
      res,
      statusCode: 500,
      message: err.message,
    });
  }
};

// update payment setting
exports.updatePaymentSetting = async (req, res) => {
  try {
    const { role } = req.user;
    if (role === "user") {
      return errorHandler({
        res,
        statusCode: 403,
        message: getMessage("M015"),
      });
    }
    const { upiId, upiQrCode } = req.body;
    const updatedSettings = await Settings.updateOne(
      {},
      { $set: { upiId, upiQrCode } }
    );
    return successHandler({
      res,
      statusCode: 200,
      message: getMessage("M050"),
      data: updatedSettings,
    });
  } catch (err) {
    return errorHandler({
      res,
      statusCode: 500,
      message: err.message,
    });
  }
};

//approve kyc by admin
exports.approveKYC = async (req, res) => {
  try {
    const { _id, role } = req.user;
    if (role === "user") {
      return errorHandler({
        res,
        statusCode: 403,
        message: getMessage("M015"),
      });
    }
    const { userId } = req.params;
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return errorHandler({
        res,
        statusCode: 400,
        message: getMessage("M002"),
      });
    }
    await User.findOneAndUpdate(
      { _id: userId },
      { isKYCVerified: true },
      { new: true }
    );
    return successHandler({
      res,
      statusCode: 200,
      message: getMessage("M049"),
    });
  } catch (err) {
    return errorHandler({
      res,
      statusCode: 500,
      message: err.message,
    });
  }
};

// get settings config
exports.getSettingsConfig = async (req, res) => {
  try {
    const data = await Settings.findOne({});
    return successHandler({
      res,
      statusCode: 200,
      data: data,
    });
  } catch (err) {
    return errorHandler({
      res,
      statusCode: 500,
      message: err.message,
    });
  }
};

exports.getAllUsersList = async (req, res) => {
  try {
    const { role } = req.user;
    if (role === "user") {
      return errorHandler({
        res,
        statusCode: 403,
        message: getMessage("M015"),
      });
    }
    const users = await User.find(
      { role: "user", isActive: true },
      { _id: 1, name: 1, mobileNo: 1 }
    );
    return successHandler({
      res,
      message: getMessage("M058"),
      statusCode: 200,
      data: users,
    });
  } catch (err) {
    return errorHandler({
      res,
      statusCode: 500,
      message: err.message,
    });
  }
};

exports.getUnverifiedUsersList = async (req, res) => {
  try {
    const { role } = req.user;
    if (role === "user") {
      return errorHandler({
        res,
        statusCode: 403,
        message: getMessage("M015"),
      });
    }

    const users = await User.find(
      { role: "user", isActive: true, isKYCVerified: false },
      { _id: 1, mobileNo: 1, kycDocument: 1 }
    );
    const usersList = users?.filter((user) => user?.kycDocument?.aadharNumber);
    return successHandler({
      res,
      message: getMessage("M059"),
      statusCode: 200,
      data: usersList,
    });
  } catch (err) {
    return errorHandler({
      res,
      statusCode: 500,
      message: err.message,
    });
  }
};
