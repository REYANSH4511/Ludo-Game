const Transaction = require("../models/transaction.model");
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
      payload.paymentMethod = paymentMethod;
      if (paymentMethod === "upi") {
        payload.upiId = upiId;
      } else if (paymentMethod === "bankAccount") {
        payload.bankAccountDetails = bankAccountDetails;
      }
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
    const filter = {};
    if (role === "user") {
      filter.userId = _id;
    }
    const transactionList = await Transaction.find(filter);
    const totalAmount = transactionList.reduce((acc, curr) => {
      if (curr.status === "approved") {
        return (
          acc +
          (curr.type === "deposit"
            ? curr.amount
            : curr.type === "withdraw"
            ? -curr.amount
            : 0)
        );
      }
      return acc;
    }, 0);
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
      { status: isApprovedKey, approvedBy: _id },
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
