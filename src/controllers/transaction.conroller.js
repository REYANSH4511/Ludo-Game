const Settings = require("../models/settings.model");
const Transaction = require("../models/transaction.model");
const User = require("../models/user.model");
const getMessage = require("../utils/message");
const { successHandler, errorHandler } = require("../utils/responseHandler");

// Create Transaction
exports.createTransaction = async (req, res) => {
  try {
    const { _id } = req.user;
    const {
      amount,
      type,
      screenShot,
      utrNo,
      userDetails,
      paymentMethod,
      upiId,
      bankAccountDetails,
    } = req.body;

    const payload = { userId: _id, amount, type, userDetails };
    const user = await User.findOne({ _id }, { balance: 1 });
    if (Number(amount) < 95) {
      return errorHandler({
        res,
        statusCode: 400,
        message: getMessage("M056"),
      });
    }

    if (type === "withdraw") {
      if (user?.balance?.cashWon < amount) {
        return errorHandler({
          res,
          statusCode: 400,
          message: getMessage("M043"),
        });
      }

      payload.paymentMethod = paymentMethod;
      if (paymentMethod === "upi") {
        payload.upiId = upiId;
      } else if (paymentMethod === "bankAccount") {
        payload.bankAccountDetails = bankAccountDetails;
      }
      user.balance.cashWon -= amount;
      user.balance.totalWalletBalance -= amount;
    } else if (type === "deposit") {
      payload.utrNo = utrNo;
      payload.screenShot = screenShot;
      const settings = await Settings.findOne({}, { upiId: 1 });
      payload.adminUPIId = settings?.upiId;
    } else if (type === "referral") {
      if (user?.balance?.referralEarning < amount) {
        return errorHandler({
          res,
          statusCode: 400,
          message: getMessage("M043"),
        });
      }

      payload.isReferral = true;
      user.balance.referralEarning -= amount;
    }

    payload.closingBalance = user.balance.totalWalletBalance;

    await Transaction.create(payload);

    await user.save();

    return successHandler({
      res,
      statusCode: 201,
      message: getMessage("M016"),
    });
  } catch (err) {
    return errorHandler({
      res,
      statusCode: 500,
      message: err.message,
    });
  }
};

// get Transaction list
exports.getTransactions = async (req, res) => {
  try {
    const { _id, role } = req.user;
    const { type } = req.query;
    const filter = {
      isReferral: false,
      isBattleTransaction: false,
      isWonCash: false,
    };
    if (role === "user") {
      filter.userId = _id;
    }
    if (type) {
      filter.type = type;
    } else {
      filter.type = ["deposit", "withdraw", "bonus", "penalty"];
    }

    const transactionList = await Transaction.find(filter)
      .populate("userId", {
        mobileNo: 1,
        name: 1,
      })
      .sort({ createdAt: -1 });

    const user = await User.findOne({ _id }, { balance: 1 });

    let totalBalance = 0;

    if (role === "user") {
      totalBalance = user?.balance?.totalBalance;
    }

    const data = { transactionList, totalBalance };
    return successHandler({
      res,
      statusCode: 200,
      message: getMessage("M017"),
      data,
    });
  } catch (err) {
    return errorHandler({
      res,
      statusCode: 500,
      message: err.message,
    });
  }
};

// transaction approve or reject by admin or super admin
exports.transactionResponse = async (req, res) => {
  try {
    const { _id, role } = req.user;
    const { isApproved, transactionId } = req.body;
    if (role === "user") {
      return errorHandler({
        res,
        statusCode: 403,
        message: getMessage("M015"),
      });
    }
    const message = isApproved ? "M018" : "M019";
    const isApprovedKey = isApproved ? "approved" : "rejected";
    const transactionDetails = await Transaction.findOne({
      _id: transactionId,
      status: "pending",
    });
    if (!transactionDetails) {
      return errorHandler({
        res,
        statusCode: 400,
        message: getMessage("M045"),
      });
    }
    const data = await Transaction.findOneAndUpdate(
      { _id: transactionId },
      { status: isApprovedKey, approvedBy: _id },
      { new: true }
    );

    const user = await User.findOne({ _id: data?.userId });

    if (isApproved) {
      if (data.type === "deposit") {
        user.balance.totalBalance = user.balance.totalBalance + data.amount;
        user.balance.totalWalletBalance =
          user.balance.totalWalletBalance + data.amount;
      }
    } else {
      if (data.type === "withdraw") {
        user.balance.cashWon = user.balance.cashWon + data.amount;
        user.balance.totalWalletBalance =
          user.balance.totalWalletBalance + data.amount;
      } else if (data.type === "referral") {
        user.balance.referralEarning =
          user.balance.referralEarning + data.amount;
      }
    }
    await user.save();
    return successHandler({
      res,
      statusCode: 200,
      message: getMessage(message),
    });
  } catch (err) {
    return errorHandler({
      res,
      statusCode: 500,
      message: err.message,
    });
  }
};
