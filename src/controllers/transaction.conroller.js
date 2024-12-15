const Transaction = require("../models/transaction.model");
const getMessage = require("../utils/message");


// Create Transaction
exports.createTransaction = async (req, res) => {
  try {
    const { _id } = req.user;
    const { amount, type, screenShot } = req.body;

    const payload = { userId: _id, amount, type };
    if (screenShot) {
      payload.screenShot = screenShot;
    }
    const data = await Transaction.create(payload);
    return successHandler({
      res,
      statusCode: 200,
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
    const transactionList = await Transaction.find({ userId: req.user._id });
    const totalAmount = data.reduce((acc, curr) => acc + curr.amount, 0);
    const data = { transactionList, totalAmount };
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

    const data = await Transaction.findOneAndUpdate(
      { _id: transactionId },
      { isApproved: isApprovedKey, approvedBy: _id },
      { new: true }
    );

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
