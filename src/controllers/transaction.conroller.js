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

    if (type === "withdraw") {
      const user = await User.findOne({ _id }, { balance: 1 });

      if (user?.balance?.totalBalance < amount) {
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
      user.balance.totalBalance -= amount;
      await user.save();
    } else {
      payload.utrNo = utrNo;
      payload.screenShot = screenShot;
    }

    await Transaction.create(payload);
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
    const filter = { isReferral: false };
    if (role === "user") {
      filter.userId = _id;
    }
    const transactionList = await Transaction.find(filter);
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
      user.balance.totalBalance =
        data.type === "deposit" && user.balance.totalBalance + data.amount;
    } else {
      user.balance.totalBalance =
        data.type === "withdraw" && user.balance.totalBalance + data.amount;
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
