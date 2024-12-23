const User = require("../models/user.model");
const Transaction = require("../models/transaction.model");
const Settings = require("../models/settings.model");
const { errorHandler } = require("./responseHandler");

//function to update withdraw transaction and total balance in schemas
const updateTransactionForStartingGame = async (userId, entryFee, battleId) => {
  try {
    const userDetails = await User.findOne({ _id: userId }, { balance: 1 });
    if (userDetails?.balance?.totalBalance < entryFee) {
      return errorHandler({
        res,
        statusCode: 400,
        message: getMessage("M043"),
      });
    }
    await Transaction.create({
      userId: userId,
      type: "withdraw",
      amount: entryFee,
      status: "approved",
      isBattleTransaction: true,
      battleId: battleId,
    });
    userDetails.balance.totalBalance -= entryFee;
    userDetails.balance.battlePlayed += 1;
    userDetails.save();
  } catch (error) {
    console.error("Error updating transaction or user:", error);
    throw error;
  }
};

const updateWinningAmountForWinner = async (data) => {
  try {
    const userDetails = await User.findOne({ _id: data.winner });

    userDetails.balance.cashWon += data.winningAmount;

    await userDetails.save();
    const referredUserDetails = await User.findOne({ _id: data.referredBy });

    if (referredUserDetails) {
      const settings = await Settings.findOne(
        {},
        { referralAmountPercentage: 1, _id: 0, __v: 0 }
      );
      const referralEarningPercentage = settings?.referralAmountPercentage || 0;
      const referralAmount =
        (data.winningAmount * referralEarningPercentage) / 100;
      // Add 2% of the winning amount to the referrer's referralEarning
      referredUserDetails.balance.referralEarning += referralAmount;

      // Check if the user exists in the referredUsers array
      const referredUser = referredUserDetails.referredUsers.find(
        (user) => user.userId.toString() === data.winner.toString()
      );

      if (referredUser) {
        // Update referralEarning for the user in the referredUsers array
        referredUser.referralEarning += referralAmount;

        // Save the updated referredUserDetails
        await referredUserDetails.save();
      }
    }
  } catch (err) {
    console.log(err);
    throw err;
  }
};

module.exports = {
  updateTransactionForStartingGame,
  updateWinningAmountForWinner,
};
